import Contact from "../models/Contact.js";

// Get all contacts
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single contact
export const getContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create contact
export const createContact = async (req, res) => {
  try {
    const { type, value, displayName, icon } = req.body;
    const contact = new Contact({
      type,
      value,
      displayName,
      icon
    });
    const savedContact = await contact.save();
    res.status(201).json(savedContact);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update contact
export const updateContact = async (req, res) => {
  try {
    const { type, value, displayName, icon } = req.body;
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    contact.type = type || contact.type;
    contact.value = value || contact.value;
    contact.displayName = displayName || contact.displayName;
    contact.icon = icon || contact.icon;

    const updatedContact = await contact.save();
    res.status(200).json(updatedContact);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete contact
export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    await contact.deleteOne();
    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Render contact management pages
export const renderContactManagement = async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.render("admin/contacts", { contacts });
  } catch (error) {
    res.status(500).render("pages/404");
  }
};

export const renderAddContact = (req, res) => {
  res.render("admin/add-contact");
};

export const renderEditContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).render("pages/404");
    }
    res.render("admin/edit-contact", { contact });
  } catch (error) {
    res.status(500).render("pages/404");
  }
}; 