const { Address } = require("../model/addressSchema");

const commonResponseHandler = (res, data, errorMessage = 'Internal Server Error') => {
  if (data instanceof Error) {
    console.error(data.message);
    return res.status(500).send(errorMessage);
  }
  return res.render('user/address');
};

module.exports.addAddressPage = (req, res) => {
  try {
    res.render('user/address');
  } catch (error) {
    commonResponseHandler(res, error);
  }
};

module.exports.addAddress = async (req, res) => {
  try {
    const id = req.session.user_id;

    const userAddress = await Address.findOne({ userId: id });
    const newAddress = {
      address: req.body.address,
      streetAddress: req.body.streetAddress,
      apartment: req.body.apartment,
      city: req.body.city,
      postcode: req.body.postcode,
      phone: req.body.phone,
      email: req.body.email,
    };

    if (userAddress) {
      userAddress.addresses.push(newAddress);
      await userAddress.save();
    } else {
      const newAddressInstance = new Address({
        userId: id,
        addresses: [newAddress],
      });

      await newAddressInstance.save();
    }

    commonResponseHandler(res, null);

  } catch (error) {
    commonResponseHandler(res, error);
  }
};

module.exports.updateAddress = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const addressId = req.params.id;

    const userAddress = await Address.findOne({ userId: userId });

    if (userAddress) {
      const addressIndex = userAddress.addresses.findIndex(
        (address) => address._id.toString() === addressId
      );

      if (addressIndex !== -1) {
        userAddress.addresses[addressIndex] = {
          address: req.body.address,
          streetAddress: req.body.streetAddress,
          apartment: req.body.apartment,
          city: req.body.city,
          phone: req.body.phone,
          postcode: req.body.postcode,
          email: req.body.email,
        };

        await userAddress.save();
        return res.redirect('/profile');
      } else {
        return res.status(404).send('Address not found');
      }
    } else {
      return res.redirect('/add-address');
    }
  } catch (error) {
    commonResponseHandler(res, error);
  }
};

module.exports.deleteAddress = async (req, res) => {
  try {
    const userID = req.session.user_id;
    const id = req.params.id;

    const removed = await Address.findOneAndUpdate(
      { userId: userID },
      { $pull: { addresses: { _id: id } } },
      { new: true }
    );

    if (removed) {
      return res.redirect('/profile');
    } else {
      return res.status(404).json({ error: 'Address not found' });
    }
  } catch (error) {
    commonResponseHandler(res, error);
  }
};
