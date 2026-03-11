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

// import {
//   getAddresses,
//   createAddress,
//   updateAddress,
//   deleteAddress,
//   setDefaultAddress,
// } from "@/api/addressApi";

const addressTypeOptions = ["shipping", "billing"];

const emptyForm = {
  label: "",
  addressType: "shipping",
  streetAddress: "",
  apartmentSuite: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
  isDefault: false,
};

const Addresses = () => {

  const [addresses, setAddresses] = useState<any[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const [addressForm, setAddressForm] = useState(emptyForm);

  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState("");

  // FETCH ADDRESSES
  const fetchAddresses = async () => {
    try {
      setIsLoadingAddresses(true);
      const data = await getAddresses();
      setAddresses(data || []);
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

      if (editingAddressId) {
        await updateAddress(editingAddressId, addressForm);
      } else {
        await createAddress(addressForm);
      }

      resetAddressForm();
      setIsAddressFormOpen(false);
      fetchAddresses();

    } catch (err: any) {
      setAddressError(err?.response?.data?.message || "Failed to save address");
    } finally {
      setIsSavingAddress(false);
    }
  };

  // EDIT ADDRESS
  const handleEditAddress = (address: any) => {
    setEditingAddressId(address.id);
    setAddressForm(address);
    setIsAddressFormOpen(true);
  };

  // DELETE ADDRESS
  const handleDeleteAddress = async (id: string) => {
    try {
      await deleteAddress(id);
      fetchAddresses();
    } catch {
      setAddressError("Failed to delete address");
    }
  };

  // SET DEFAULT
  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress(id);
      fetchAddresses();
    } catch {
      setAddressError("Failed to set default address");
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
        <p className="text-sm text-muted-foreground">
          Loading addresses...
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {addresses.map((address) => (
          <Card key={address.id}>
            <CardContent className="p-5">

              <div className="flex justify-between mb-3">

                <div className="flex gap-2 items-center">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-semibold">
                    {address.label || "Address"}
                  </span>
                </div>

                {address.isDefault && (
                  <Badge variant="secondary">Default</Badge>
                )}

              </div>

              <p className="text-sm text-muted-foreground">
                {address.streetAddress}
              </p>

              <p className="text-sm text-muted-foreground">
                {[address.city, address.state, address.zipCode]
                  .filter(Boolean)
                  .join(", ")}
              </p>

              <div className="mt-4 flex gap-2">

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditAddress(address)}
                >
                  <Edit3 className="mr-1 h-3 w-3" />
                  Edit
                </Button>

                {!address.isDefault && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSetDefault(address.id)}
                  >
                    Set Default
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => handleDeleteAddress(address.id)}
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Remove
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