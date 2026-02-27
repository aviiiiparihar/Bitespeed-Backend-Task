const {
  findContactsByEmailOrPhone,
  createPrimaryContact,
  createSecondaryContact,
  getAllLinkedContacts,
  updateToSecondary,
  relinkSecondaryContacts,
} = require("../services/contact.service");

const getPrimaryContactId = (contact) => {
  if (!contact) return null;
  return contact.linkPrecedence === "primary" ? contact.id : contact.linkedId;
};

const sortByCreatedAt = (a, b) =>
  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

const buildResponse = (contacts, primaryId) => {
  const primaryContact = contacts.find((contact) => contact.id === primaryId) || null;
  const otherContacts = contacts.filter((contact) => contact.id !== primaryId);

  const emails = [];
  const phoneNumbers = [];
  const secondaryContactIds = new Set();

  if (primaryContact?.email) emails.push(primaryContact.email);
  if (primaryContact?.phoneNumber) phoneNumbers.push(primaryContact.phoneNumber);

  for (const contact of otherContacts) {
    if (contact.email && !emails.includes(contact.email)) {
      emails.push(contact.email);
    }
    if (contact.phoneNumber && !phoneNumbers.includes(contact.phoneNumber)) {
      phoneNumbers.push(contact.phoneNumber);
    }
    if (contact.linkPrecedence === "secondary") {
      secondaryContactIds.add(contact.id);
    }
  }

  return {
    contact: {
      primaryContactId: primaryId,
      emails,
      phoneNumbers,
      secondaryContactIds: [...secondaryContactIds],
    },
  };
};

const identify = async (req, res, next) => {
  try {
    const rawEmail = req.body?.email;
    const rawPhoneNumber = req.body?.phoneNumber;
    const email = typeof rawEmail === "string" ? rawEmail.trim() : rawEmail;
    const phoneNumber =
      typeof rawPhoneNumber === "string" ? rawPhoneNumber.trim() : rawPhoneNumber;

    if (!email && !phoneNumber) {
      const validationError = new Error(
        "At least one of email or phoneNumber is required"
      );
      validationError.statusCode = 400;
      throw validationError;
    }

    const { data: matchedContacts, error: matchError } =
      await findContactsByEmailOrPhone(email, phoneNumber);
    if (matchError) {
      throw matchError;
    }

    if (!matchedContacts || matchedContacts.length === 0) {
      const { data: newPrimaryContact, error: createError } = await createPrimaryContact(
        email,
        phoneNumber
      );
      if (createError) {
        throw createError;
      }

      return res.status(200).json(
        buildResponse([newPrimaryContact], newPrimaryContact.id)
      );
    }

    const initialPrimaryIds = [
      ...new Set(matchedContacts.map(getPrimaryContactId).filter(Boolean)),
    ];

    const { data: linkedContacts, error: linkedError } = await getAllLinkedContacts(
      initialPrimaryIds
    );
    if (linkedError) {
      throw linkedError;
    }

    let allContacts = [...(linkedContacts || [])];
    const primaryContacts = allContacts
      .filter((contact) => contact.linkPrecedence === "primary")
      .sort(sortByCreatedAt);

    const oldestPrimary = primaryContacts[0];
    if (!oldestPrimary) {
      throw new Error("No primary contact found in linked contacts");
    }

    const newerPrimaries = primaryContacts.slice(1);

    for (const newerPrimary of newerPrimaries) {
      const { error: demoteError } = await updateToSecondary(
        newerPrimary.id,
        oldestPrimary.id
      );
      if (demoteError) {
        throw demoteError;
      }

      const { error: relinkError } = await relinkSecondaryContacts(
        newerPrimary.id,
        oldestPrimary.id
      );
      if (relinkError) {
        throw relinkError;
      }
    }

    const { data: refreshedContacts, error: refreshError } = await getAllLinkedContacts([
      oldestPrimary.id,
    ]);
    if (refreshError) {
      throw refreshError;
    }

    allContacts = [...(refreshedContacts || [])];

    const existingEmails = new Set(allContacts.map((contact) => contact.email).filter(Boolean));
    const existingPhoneNumbers = new Set(
      allContacts.map((contact) => contact.phoneNumber).filter(Boolean)
    );

    const hasNewEmail = !!email && !existingEmails.has(email);
    const hasNewPhoneNumber = !!phoneNumber && !existingPhoneNumbers.has(phoneNumber);

    if (hasNewEmail || hasNewPhoneNumber) {
      const { error: createSecondaryError } = await createSecondaryContact(
        oldestPrimary.id,
        email || null,
        phoneNumber || null
      );
      if (createSecondaryError) {
        throw createSecondaryError;
      }

      const { data: finalContacts, error: finalContactsError } = await getAllLinkedContacts([
        oldestPrimary.id,
      ]);
      if (finalContactsError) {
        throw finalContactsError;
      }
      allContacts = [...(finalContacts || [])];
    }

    return res.status(200).json(buildResponse(allContacts, oldestPrimary.id));
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  identify,
};
