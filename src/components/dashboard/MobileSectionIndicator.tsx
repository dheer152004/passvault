import { useState } from "react";
import { Plus, FileText, Pencil, Trash2, Search, Heart } from "lucide-react";
import { VaultBadge } from "./VaultBadge";
import { SortableList } from "./SortableList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { VaultSelect } from "./VaultSelect";

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  isFavorite?: boolean;
  vaultId?: string;
}

interface NotesSectionProps {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  showFavoritesOnly?: boolean;
  activeVaultId?: string;
}

export function NotesSection({ notes, setNotes, showFavoritesOnly = false, activeVaultId }: NotesSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState({ title: "", content: "", vaultId: undefined as string | undefined });

  const filteredNotes = notes.filter((n) => {
    const matchesSearch = 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorite = !showFavoritesOnly || n.isFavorite;
    const matchesVault = !activeVaultId || n.vaultId === activeVaultId;
    return matchesSearch && matchesFavorite && matchesVault;
  });

  const handleAddNote = () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    const newNote: Note = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString().split("T")[0],
      isFavorite: false,
      vaultId: activeVaultId || formData.vaultId,
    };
    setNotes([...notes, newNote]);
    setFormData({ title: "", content: "", vaultId: undefined });
    setIsAddDialogOpen(false);
    toast.success("Note added successfully");
  };

  const handleEditNote = () => {
    if (!editingNote) return;
    setNotes(
      notes.map((n) =>
        n.id === editingNote.id ? { ...n, ...formData } : n
      )
    );
    setEditingNote(null);
    setFormData({ title: "", content: "", vaultId: undefined });
    toast.success("Note updated successfully");
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
    toast.success("Note deleted successfully");
  };

  const toggleFavorite = (id: string) => {
    const note = notes.find(n => n.id === id);
    setNotes(notes.map(n => 
      n.id === id ? { ...n, isFavorite: !n.isFavorite } : n
    ));
    toast.success(note?.isFavorite ? "Removed from favorites" : "Added to favorites");
  };

  const openEditDialog = (note: Note) => {
    setEditingNote(note);
    setFormData({ title: note.title, content: note.content, vaultId: note.vaultId });
  };

  const handleReorder = (reorderedNotes: Note[]) => {
    // Get all notes that are not in the filtered list
    const otherNotes = notes.filter(n => !filteredNotes.some(fn => fn.id === n.id));
    // Merge reordered filtered notes with other notes
    setNotes([...reorderedNotes, ...otherNotes]);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Secure Notes</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Store sensitive information securely
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Note</DialogTitle>
            </DialogHeader>
            <NoteForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleAddNote}
              submitLabel="Add Note"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
        <Input
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg border border-border">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" strokeWidth={1.5} />
          <p className="text-muted-foreground">No notes found</p>
        </div>
      ) : (
        <SortableList
          items={filteredNotes}
          onReorder={handleReorder}
          renderItem={(note) => (
            <div className="bg-background border border-border rounded-lg p-4 hover:border-primary/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-medium text-foreground">{note.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {note.content || "No content"}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleFavorite(note.id)}
                        className="p-2 rounded-md hover:bg-muted transition-colors"
                        aria-label={note.isFavorite ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Heart 
                          className={`w-4 h-4 transition-colors ${note.isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground"}`} 
                          strokeWidth={1.5} 
                        />
                      </button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            onClick={() => openEditDialog(note)}
                            className="p-2 rounded-md hover:bg-muted transition-colors"
                            aria-label="Edit note"
                          >
                            <Pencil className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                          </button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Note</DialogTitle>
                          </DialogHeader>
                          <NoteForm
                            formData={formData}
                            setFormData={setFormData}
                            onSubmit={handleEditNote}
                            submitLabel="Save Changes"
                          />
                        </DialogContent>
                      </Dialog>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-2 rounded-md hover:bg-muted transition-colors"
                        aria-label="Delete note"
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-xs text-muted-foreground">
                      Created: {note.createdAt}
                    </p>
                    <VaultBadge vaultId={note.vaultId} />
                  </div>
                </div>
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
}

interface NoteFormProps {
  formData: { title: string; content: string; vaultId?: string };
  setFormData: React.Dispatch<React.SetStateAction<{ title: string; content: string; vaultId?: string }>>;
  onSubmit: () => void;
  submitLabel: string;
}

function NoteForm({ formData, setFormData, onSubmit, submitLabel }: NoteFormProps) {
  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="e.g., WiFi Password"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          placeholder="Enter your note content..."
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={5}
        />
      </div>
      <VaultSelect
        value={formData.vaultId}
        onChange={(value) => setFormData({ ...formData, vaultId: value })}
      />
      <Button onClick={onSubmit} className="w-full">
        {submitLabel}
      </Button>
    </div>
  );
}
