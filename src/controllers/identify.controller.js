const identify = (req, res) => {
  const { email, phoneNumber } = req.body || {};

  if (!email && !phoneNumber) {
    return res.status(400).json({
      error: "At least one of email or phoneNumber is required",
    });
  }

  return res.status(200).json({
    message: "endpoint working",
  });
};

module.exports = {
  identify,
};
