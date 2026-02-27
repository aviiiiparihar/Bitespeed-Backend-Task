const supabase = require("../config/supabase");

const CONTACT_TABLE = "Contact";

const findContactsByEmailOrPhone = async (email, phone) => {
  let query = supabase.from(CONTACT_TABLE).select("*").is("deletedAt", null);

  if (email && phone) {
    query = query.or(`email.eq.${email},phoneNumber.eq.${phone}`);
  } else if (email) {
    query = query.eq("email", email);
  } else if (phone) {
    query = query.eq("phoneNumber", phone);
  }

  return query;
};

const createPrimaryContact = async (email, phone) => {
  const now = new Date().toISOString();

  return supabase
    .from(CONTACT_TABLE)
    .insert({
      email: email || null,
      phoneNumber: phone || null,
      linkedId: null,
      linkPrecedence: "primary",
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    })
    .select()
    .single();
};

const createSecondaryContact = async (primaryId, email, phone) => {
  const now = new Date().toISOString();

  return supabase
    .from(CONTACT_TABLE)
    .insert({
      email: email || null,
      phoneNumber: phone || null,
      linkedId: primaryId,
      linkPrecedence: "secondary",
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    })
    .select()
    .single();
};

const getAllLinkedContacts = async (contactIds) => {
  if (!Array.isArray(contactIds) || contactIds.length === 0) {
    return { data: [], error: null };
  }

  const ids = [...new Set(contactIds)].filter(
    (id) => Number.isInteger(id) || (typeof id === "number" && Number.isFinite(id))
  );

  if (ids.length === 0) {
    return { data: [], error: null };
  }

  const idList = ids.join(",");

  return supabase
    .from(CONTACT_TABLE)
    .select("*")
    .is("deletedAt", null)
    .or(`id.in.(${idList}),linkedId.in.(${idList})`);
};

const updateToSecondary = async (contactId, primaryId) => {
  const now = new Date().toISOString();

  return supabase
    .from(CONTACT_TABLE)
    .update({
      linkedId: primaryId,
      linkPrecedence: "secondary",
      updatedAt: now,
    })
    .eq("id", contactId)
    .select()
    .single();
};

const relinkSecondaryContacts = async (oldPrimaryId, newPrimaryId) => {
  const now = new Date().toISOString();

  return supabase
    .from(CONTACT_TABLE)
    .update({
      linkedId: newPrimaryId,
      updatedAt: now,
    })
    .eq("linkedId", oldPrimaryId)
    .is("deletedAt", null);
};

module.exports = {
  findContactsByEmailOrPhone,
  createPrimaryContact,
  createSecondaryContact,
  getAllLinkedContacts,
  updateToSecondary,
  relinkSecondaryContacts,
};
