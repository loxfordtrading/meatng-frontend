import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { axiosClient } from "@/GlobalApi";
import z from "zod";
import { toast } from "react-toastify";
import { LoadingData } from "../LoadingData";

const profileSchema = z.object({
  first_name: z.string().min(1, "first name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.coerce.string()
    .regex(/^\d+$/, "Phone number must contain only digits")
    .refine((val) => {
      if (val.startsWith("0")) return val.length === 11;
      return val.length === 10;
    }, {
      message: "Phone number must be 11 digits if it starts with 0, otherwise 10 digits",
    })
    .transform((val) => (val.startsWith("0") ? val.slice(1) : val)),
});

const newPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Old password is required"),
    newPassword: z
      .string()
      .min(8,  "New Password must be at least 8 characters")
      .regex(/[A-Z]/, "New Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "New Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "New Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "New Password must contain at least one special character"),

    confirmPassword: z.string().min(1, "Invalid confirm new password")
  })
  .refine(
    data => data.confirmPassword === data.newPassword,
    {
      path: ["confirmNewPassword"],   // put the error on this field
      message: "Confirm Password does not match"
    }
  )

  
type ProfileFormValues = z.infer<typeof profileSchema>

type NewPasswordFormValues = z.infer<typeof newPasswordSchema>


const Settings = () => {

  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [originalProfile, setOriginalProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmittingPassword, setIsSubmittingPassword] = useState(false)

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword({
      ...password,
      [e.target.name]: e.target.value,
    });
  };

  const togglePassword = (field: keyof typeof showPassword) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field],
    });
  };

   useEffect(() => {
        fetchProfile();
    }, []);

  const fetchProfile = async () => {
      try {
        const response = await axiosClient.get("/users/me");

        const formatted = {
          first_name: response.data?.data?.attributes?.first_name || "",
          last_name: response.data?.data?.attributes?.last_name || "",   
          email: response.data?.data?.attributes?.email || "",
          phone: response.data?.data?.attributes?.phone || ""
        };

        setProfile(formatted);
        setOriginalProfile(formatted);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false)
      }
    };

    const hasChanges = () => {
        if (!originalProfile) return true;

        const current = JSON.stringify(profile);
        const original = JSON.stringify(originalProfile);

        return current !== original;
    };

  const handleSaveSettings = async () => {

    const result = profileSchema.safeParse(profile)
        
    if (!result.success) {
        const fieldErrors: Partial<Record<keyof ProfileFormValues, string>> = {};
        result.error.errors.forEach((err) => {
            const field = err.path[0] as keyof ProfileFormValues
            fieldErrors[field] = err.message
        })
        toast.error(Object.values(fieldErrors)[0]);
        return
    }

    if (!hasChanges()) {
        return toast.error("No changes detected.")
    }

    try {
      setIsSubmitting(true)

      const response = await axiosClient.patch("/users/me", profile);

      const formatted = {
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        phone: profile.phone,
      };

      setOriginalProfile(formatted);
      toast.success("Profile updated successfully")

    } catch (err) {
      toast.error(err.response?.data?.message);
    } finally {
      setIsSubmitting(false)
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    const result = newPasswordSchema.safeParse(password)

        if (!result.success) {
            const fieldErrors: Partial<{
            oldPassword: string;
            newPassword: string;
            confirmNewPassword: string;
        }> = {};
        result.error.errors.forEach((err) => {
            const field = err.path[0] as keyof NewPasswordFormValues
            fieldErrors[field] = err.message
        })
        toast.error(Object.values(fieldErrors)[0]);
        setPasswordError(Object.values(fieldErrors)[0]);
        return
    }

    try {
       setIsSubmittingPassword(true)

      const response = await axiosClient.patch("/auth/change-password", password);

        setPassword({
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        })

        toast.error("Password updated successfully");
        setPasswordSuccess("Password updated successfully");

    } catch (err) {
      toast.error(err.response?.data?.message);
      setPasswordError(err.response?.data?.message);
    } finally {
      setIsSubmittingPassword(false)
    }
  };

  return (
    <div className="space-y-6 animate-fade-in admin-page-bg rounded-3xl p-4 sm:p-5">

      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">
          Account Settings
        </h2>
        <p className="text-muted-foreground mt-1">
          Update your personal information and preferences.
        </p>
      </div>

        {loading ? (
            <LoadingData/>
        ) : (
            <div className="space-y-6">
                {/* PERSONAL INFO */}
                <Card className="admin-card">
                    <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input
                            name="first_name"
                            value={profile.first_name}
                            onChange={handleProfileChange}
                            className="h-11 rounded-xl"
                        />
                        </div>

                        <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input
                            name="last_name"
                            value={profile.last_name}
                            onChange={handleProfileChange}
                            className="h-11 rounded-xl"
                        />
                        </div>

                        <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                            name="email"
                            value={profile.email}
                            readOnly
                            className="h-11 rounded-xl"
                        />
                        </div>

                        <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input
                            name="phone"
                            value={profile.phone}
                            onChange={handleProfileChange}
                            placeholder="+234..."
                            className="h-11 rounded-xl"
                        />
                        </div>

                    </div>

                        <Button disabled={isSubmitting} size="sm" onClick={handleSaveSettings}>
                            {isSubmitting ? "Updating..." : "Save Changes"}
                        </Button>

                    </CardContent>
                </Card>

                {/* PASSWORD */}
                <Card className="admin-card">
                    <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* CURRENT PASSWORD */}
                        <div className="space-y-2 relative">
                        <Label>Current Password</Label>
                        <Input
                            type={showPassword.currentPassword ? "text" : "password"}
                            name="currentPassword"
                            value={password.currentPassword}
                            onChange={handlePasswordChange}
                            className="h-11 rounded-xl pr-10"
                        />

                        <button
                            type="button"
                            onClick={() => togglePassword("currentPassword")}
                            className="absolute right-3 top-[38px] text-muted-foreground"
                        >
                            {showPassword.currentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        </div>

                        {/* NEW PASSWORD */}
                        <div className="space-y-2 relative">
                        <Label>New Password</Label>
                        <Input
                            type={showPassword.newPassword ? "text" : "password"}
                            name="newPassword"
                            value={password.newPassword}
                            onChange={handlePasswordChange}
                            className="h-11 rounded-xl pr-10"
                        />

                        <button
                            type="button"
                            onClick={() => togglePassword("newPassword")}
                            className="absolute right-3 top-[38px] text-muted-foreground"
                        >
                            {showPassword.newPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div className="space-y-2 relative">
                        <Label>Confirm Password</Label>
                        <Input
                            type={showPassword.confirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={password.confirmPassword}
                            onChange={handlePasswordChange}
                            className="h-11 rounded-xl pr-10"
                        />

                        <button
                            type="button"
                            onClick={() => togglePassword("confirmPassword")}
                            className="absolute right-3 top-[38px] text-muted-foreground"
                        >
                            {showPassword.confirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        </div>

                    </div>

                    {passwordError && (
                        <p className="text-sm text-destructive">{passwordError}</p>
                    )}

                    {passwordSuccess && (
                        <p className="text-sm text-emerald-600">{passwordSuccess}</p>
                    )}

                        <Button disabled={isSubmittingPassword} size="sm" variant="outline" onClick={handleChangePassword}>
                            {isSubmittingPassword ? "Updating..." : "Change password"}
                        </Button>

                    </CardContent>
                </Card>
            </div>
        )}
    </div>
  );
};

export default Settings;