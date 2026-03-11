import {
  MapPin,
  Edit3,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { axiosClient } from "@/GlobalApi";
import { AddressType } from "@/types/types";
import { LoadingData } from "../LoadingData";
import { toast } from "react-toastify";
import { useAuthStore } from "@/store/AuthStore";

const addressTypeOptions = ["shipping", "billing"];

const emptyForm = {
  label: "",
  addressType: "shipping",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  streetAddress: "",
  apartmentSuite: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
  isDefault: false,
};

const Addresses = () => {

  const userInfo = useAuthStore(state => state.userInfo)
  const [addresses, setAddresses] = useState<AddressType[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [loadingDefaultId, setLoadingDefaultId] = useState<string | null>(null);
  const [loadingDeleteId, setLoadingDeleteId] = useState<string | null>(null);

  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const [addressForm, setAddressForm] = useState(emptyForm);

  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState("");

    const formatAddress = (apiData: AddressType): typeof emptyForm => {
        const a = apiData.attributes;
        return {
            label: a.label || "",
            addressType: a.address_type as "shipping" | "billing",
            firstName: a.first_name || "",
            lastName: a.last_name || "",
            email: a.email || "",
            phone: a.phone || "",
            streetAddress: a.street_address || "",
            apartmentSuite: a.apartment_suite || "",
            city: a.city || "",
            state: a.state || "",
            zipCode: a.zip_code || "",
            country: a.country || "",
            isDefault: a.is_default || false,
        };
    };

  // FETCH ADDRESSES
  const fetchAddresses = async () => {
    try {
      setIsLoadingAddresses(true);
      const res = await axiosClient.get("/addresses");
      setAddresses(res.data?.data || []);
    } catch (err: any) {
      setAddressError(err?.response?.data?.message || "Failed to load addresses");
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // RESET FORM
  const resetAddressForm = () => {
    setAddressForm(emptyForm);
    setEditingAddressId(null);
  };

  // SAVE ADDRESS
  const handleSaveAddress = async () => {
    try {
      setIsSavingAddress(true);

        const newAddressData = {
            address_type: addressForm.addressType,
            first_name: addressForm.firstName,
            last_name: addressForm.lastName,
            email: addressForm.email,
            phone: addressForm.phone,
            label: addressForm.label,
            street_address: addressForm.streetAddress,
            apartment_suite: addressForm.apartmentSuite,
            city: addressForm.city,
            state: addressForm.state,
            zip_code: addressForm.zipCode,
            country: addressForm.country,
            is_default: addressForm.isDefault
        }

      if (editingAddressId) {
        const res = await axiosClient.patch(`/addresses/${editingAddressId}`, newAddressData);
        toast.success("Address Updated")
      } else {
        const newAddress = {
            ...newAddressData,
            user_id: userInfo.userId
        }
        const res = await axiosClient.post("/addresses", newAddress);
        toast.success("Address Created")
      }

      resetAddressForm();
      setIsAddressFormOpen(false);
      fetchAddresses();

    } catch (err: any) {
      toast.success(err?.response?.data?.message)
      setAddressError(err?.response?.data?.message || "Failed to save address");
    } finally {
      setIsSavingAddress(false);
    }
  };

  // EDIT ADDRESS
  const handleEditAddress = (address: any, id: string) => {
    setEditingAddressId(id);
    setAddressForm(address);
    setIsAddressFormOpen(true);
  };

  // DELETE ADDRESS
  const handleDeleteAddress = async (id: string) => {
    try {
      setLoadingDeleteId(id);
      await axiosClient.delete(`/addresses/${id}`);
      toast.success("Address Deleted")
      fetchAddresses();
    } catch {
      setAddressError("Failed to delete address");
    } finally {
        setLoadingDeleteId(null);
    }
  };

  // SET DEFAULT
  const handleSetDefault = async (id: string) => {
    try {
        setLoadingDefaultId(id);
      const res = await axiosClient.patch(`/addresses/${id}/set-default`);
      toast.success("Address set as default")
      fetchAddresses();
    } catch {
      setAddressError("Failed to set default address");
    } finally {
        setLoadingDefaultId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in admin-page-bg rounded-3xl p-4 sm:p-5">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold">
            Delivery Addresses
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage your saved delivery locations.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsAddressFormOpen((prev) => !prev)}
        >
          <Plus className="mr-2 h-3.5 w-3.5" />
          {isAddressFormOpen ? "Close" : "Add Address"}
        </Button>
      </div>

      {/* ADDRESS FORM */}

      {isAddressFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingAddressId ? "Edit Address" : "Add Address"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="space-y-2">
                <Label>Label</Label>
                <Input
                  value={addressForm.label}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      label: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Address Type</Label>
                <div className="flex gap-2">
                  {addressTypeOptions.map((type) => (
                    <Button
                      key={type}
                      type="button"
                      size="sm"
                      variant={addressForm.addressType === type ? "default" : "outline"}
                      onClick={() =>
                        setAddressForm({ ...addressForm, addressType: type })
                      }
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              <Input
                placeholder="First name"
                value={addressForm.firstName}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, firstName: e.target.value })
                }
              />

              <Input
                placeholder="Last name"
                value={addressForm.lastName}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, lastName: e.target.value })
                }
              />

              <Input
                placeholder="email"
                type="email"
                value={addressForm.email}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, email: e.target.value })
                }
              />

              <Input
                placeholder="Phone"
                value={addressForm.phone}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, phone: e.target.value })
                }
              /> 

              <div className="space-y-2 md:col-span-2">
                <Label>Street Address</Label>
                <Input
                  value={addressForm.streetAddress}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      streetAddress: e.target.value,
                    })
                  }
                />
              </div>

              <Input
                placeholder="City"
                value={addressForm.city}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, city: e.target.value })
                }
              />

              <Input
                placeholder="State"
                value={addressForm.state}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, state: e.target.value })
                }
              />

              <Input
                placeholder="Zip Code"
                value={addressForm.zipCode}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, zipCode: e.target.value })
                }
              />

              <Input
                placeholder="Country"
                value={addressForm.country}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, country: e.target.value })
                }
              />

            </div>

            {addressError && (
              <p className="text-sm text-destructive">{addressError}</p>
            )}

            <div className="flex gap-2">

              <Button
                size="sm"
                onClick={handleSaveAddress}
                disabled={isSavingAddress}
              >
                {isSavingAddress
                  ? "Saving..."
                  : editingAddressId
                  ? "Update Address"
                  : "Save Address"}
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  resetAddressForm();
                  setIsAddressFormOpen(false);
                }}
              >
                Cancel
              </Button>

            </div>

          </CardContent>
        </Card>
      )}

      {/* ADDRESS LIST */}

      {isLoadingAddresses && (
        <LoadingData/>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {addresses.map((address) => (
          <Card key={address.id}>
            <CardContent className="p-5">

              <div className="flex justify-between mb-3">

                <div className="flex gap-2 items-center">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-semibold">
                    {address?.attributes?.address_type || "Address"}
                  </span>
                </div>

                {address?.attributes?.is_default && (
                  <Badge variant="secondary">Default</Badge>
                )}

              </div>

              <p className="text-sm text-muted-foreground">
                {address?.attributes?.street_address}
              </p>

              <p className="text-sm text-muted-foreground">
                {[address?.attributes?.city, address?.attributes?.state, address?.attributes?.zip_code]
                  .filter(Boolean)
                  .join(", ")}
              </p>

              <div className="mt-4 flex gap-2">

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditAddress(formatAddress(address), address.id)}
                >
                  <Edit3 className="mr-1 h-3 w-3" />
                  Edit
                </Button>

                {!address?.attributes?.is_default && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={(loadingDefaultId === address.id) || isLoadingAddresses}
                    onClick={() => handleSetDefault(address.id)}
                  >
                    {loadingDefaultId === address.id ? "Setting..." : "Set Default"}
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  disabled={(loadingDeleteId === address.id) || isLoadingAddresses}
                  onClick={() => handleDeleteAddress(address.id)}
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  {loadingDeleteId === address.id ? "Removing..." : "Remove"}
                </Button>

              </div>

            </CardContent>
          </Card>
        ))}

      </div>

    </div>
  );
};

export default Addresses;