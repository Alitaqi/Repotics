import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function App() {
  return (
    <div className="p-6">
      <Dialog>
        <DialogTrigger asChild>
          <button className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600">
            Open Dialog
          </button>
        </DialogTrigger>
        
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. It will permanently delete your account.
            </DialogDescription>
          </DialogHeader>
          <p className="mt-4">Here you can put any content or form.</p>
        </DialogContent>
      </Dialog>
      <div>
      <div>
        
      </div>
      </div>
    </div>
    

  );
}
