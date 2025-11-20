import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from "@mui/material";

export default function ConfirmDialog({ open, title, message, onConfirm, onClose }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle className="font-semibold">{title}</DialogTitle>

      <DialogContent>
        <p className="text-gray-700">{message}</p>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          className="shadow-none"
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
