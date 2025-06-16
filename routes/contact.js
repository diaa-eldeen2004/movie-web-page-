import express from "express";
import {
  getAllContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  renderContactManagement,
  renderAddContact,
  renderEditContact
} from "../controllers/contactController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// API Routes
router.get("/api/contacts", getAllContacts);
router.get("/api/contacts/:id", getContact);
router.post("/api/contacts", auth(["admin"]), createContact);
router.put("/api/contacts/:id", auth(["admin"]), updateContact);
router.delete("/api/contacts/:id", auth(["admin"]), deleteContact);

// Page Routes
router.get("/contacts", auth(["admin"]), renderContactManagement);
router.get("/contacts/add", auth(["admin"]), renderAddContact);
router.get("/contacts/edit/:id", auth(["admin"]), renderEditContact);

export default router; 