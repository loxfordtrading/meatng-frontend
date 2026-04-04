import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ContactType } from '@/types/admin'
import { format } from 'date-fns'
import { Eye } from 'lucide-react'

export const Viewcontact = ({contact}: {contact: ContactType}) => {
  return (
    <Dialog>
      <div>
        <DialogTrigger as-child>
          <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg bcontact bcontact-bcontact/70 p-0">
              <Eye className="h-3.5 w-3.5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="lg:max-w-[1024px] max-h-[95%] bg-white overflow-y-auto scrollbar-rounded">
          <DialogHeader>
            <DialogTitle>contact Type: {contact?.email}</DialogTitle>
          </DialogHeader>
          <div className='space-y-6'>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Name:</h2>
                  <h2 className='font-semibold'>{contact?.name}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Email:</h2>
                  <h2 className='font-semibold'>{contact?.email}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Order ID:</h2>
                  <h2 className='font-semibold'>{contact?.orderNumber ? contact?.orderNumber : "N/A"}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Priority:</h2>
                  <h2 className='font-semibold'>{contact?.isHighPriority ? "Yes" : "No"}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Status:</h2>
                  <h2 className='font-semibold'>{contact?.status}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Date created:</h2>
                  <h2 className='font-semibold'>{contact?.createdAt ? format(new Date(contact?.createdAt), "dd MMM yyyy hh:mm a") : "N/A"}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Last Updated:</h2>
                  <h2 className='font-semibold'>{contact?.updatedAt ? format(new Date(contact?.updatedAt), "dd MMM yyyy hh:mm a") : "N/A"}</h2>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="flex flex-col">
              <h2 className="text-gray-600 font-medium">Message:</h2>
              <h2 className='font-semibold'>{contact?.message}</h2>
            </div>
          </div>
          <DialogFooter className="gap-4">
            <DialogClose>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </div>
  </Dialog>
  )
}