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
import { Field } from '../ui/field'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../ui/select'
import { Input } from '../ui/input'
import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/lib/routes'
import { FormEvent, useEffect, useState } from 'react'
import z from 'zod'
import { toast } from "react-toastify"
import { debounce } from "lodash"
import { axiosClient } from '@/GlobalApi'



const registerSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum([
    "admin",
  ], {
    message: "Role is required",
  })
});

type RegisterFormValues = z.infer<typeof registerSchema>

export const AddAdmin = ({ getAdmins }: { getAdmins: () => void }) => {

    const [form, setForm] = useState({
      first_name: '',
      last_name: '',
      email: '',
      role: 'admin'
    })
    const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormValues, string>>>({})
    const [touched, setTouched] = useState<Partial<Record<keyof RegisterFormValues, boolean>>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [open, setOpen] = useState(false)

  const validation = registerSchema.safeParse(form);

  const canSubmit = validation.success;

  // Debounced validation
  const validateForm = debounce((updatedForm: RegisterFormValues) => {
    const result = registerSchema.safeParse(updatedForm)
    if (!result.success) {
      const fieldErrors: typeof errors = {}
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof RegisterFormValues
        fieldErrors[field] = err.message
      })
      setErrors(fieldErrors)
    } else {
      setErrors({})
    }
  }, 300)

  useEffect(() => {
    validateForm(form)
    return () => validateForm.cancel()
  }, [form])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const result = registerSchema.safeParse(form)

    if (!result.success) {
      const fieldErrors: typeof errors = {}
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof RegisterFormValues
        fieldErrors[field] = err.message
      })
      setErrors(fieldErrors)
      setTouched({
        first_name: true,
        last_name: true,
        email: true,
        role: true
      })
      return
    }

    setErrors({})
    
    try {

      setIsSubmitting(true)
      
      const { first_name, last_name, ...rest } = form;

      const newForm = {
        ...rest,
        firstName: first_name,
        lastName: last_name,
      };

      const result = await axiosClient.post("/auth/invite-admin", newForm)
      toast.success(result.data?.data?.attributes?.message);
      getAdmins()

      setForm({
        first_name: "",
        last_name: "",
        email: "",
        role: "admin"
      })

      setErrors({})
      setTouched({})
      setOpen(false)

    } catch (error: any) {
      toast.error(error.response?.data?.message);
    } finally {
      setIsSubmitting(false)
    } 
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger as-child>
        <Button size="sm">
          <Plus className="mr-2 h-3.5 w-3.5" /> Invite Admin
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[95%] overflow-y-auto scrollbar-rounded">
        <DialogHeader>
          <DialogTitle>Add New Admin User</DialogTitle>
          <DialogDescription className="text-gray-400">Creating a new admin gives access to all data here</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 flex-start gap-4">
            <Field className="grid gap-1">
              <Label htmlFor="firstname">
                First Name
              </Label>
              <Input id="firstname"
                value={form.first_name} 
                onChange={(e: any) => setForm({ ...form, first_name: e.target.value})} 
                onBlur={() => setTouched((prev) => ({ ...prev, first_name: true }))}
                placeholder="Adebola"
                className="h-12 rounded-xl bg-white w-full"
                />
                {touched.first_name && errors.first_name && (
                  <p className="text-xs text-destructive">{errors.first_name}</p>
                )}
            </Field>
            <Field className="grid gap-1">
              <Label htmlFor="lastname">
                Last Name
              </Label>
              <Input
                id="lastname"
                value={form.last_name} 
                onChange={(e: any) => setForm({ ...form, last_name: e.target.value})} 
                onBlur={() => setTouched((prev) => ({ ...prev, last_name: true }))}
                placeholder="Okonkwo"
                className="h-12 rounded-xl bg-white w-full"
              />
              {touched.last_name && errors.last_name && (
                <p className="text-xs text-destructive">{errors.last_name}</p>
              )}
            </Field>
          </div>
          <Field className="grid gap-1">
            <Label htmlFor="email">
              Work Email
            </Label>
            <Input
              id="signup-email"
              type="email"
              value={form.email} 
              onChange={(e: any) => setForm({ ...form, email: e.target.value})} 
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              placeholder="you@example.com"
              className="h-12 rounded-xl bg-white"
            />
            {touched.email && errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </Field>
          <Field className="grid gap-1">
            <Label>
              Select Role
            </Label>
            <Select
              value={form.role}
              onValueChange={(value) => {
                setForm({ ...form, role: value })
                setTouched((prev) => ({ ...prev, role: true }))
              }}
            >
              <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                  <SelectGroup>
                      <SelectItem value="admin">
                        Admin
                      </SelectItem>
                  </SelectGroup>
              </SelectContent>
            </Select>
            {touched.role && errors.role && (
              <p className="text-xs text-destructive">{errors.role}</p>
            )}
          </Field>
        </div>
        <DialogFooter className="gap-2">
          <DialogClose as-child>
            <Button variant="outline" className='w-full'>
              Cancel
            </Button>
          </DialogClose>
          <Button className='w-full' type='submit' onClick={handleSubmit}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Sending...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Send Invitation
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
