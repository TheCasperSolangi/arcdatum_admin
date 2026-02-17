// app/(admin)/app-settings/page.js
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const BASE_API = `${process.env.NEXT_PUBLIC_API_URL}/settings`;

export default function AppSettingsPage() {
  const [settings, setSettings] = useState({
    appName: "",
    appLogo: "",
    enviroment: "development",
    primaryColor: "#000000",
    secondaryColor: "#ffffff",
    appVersion: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    twitter: "",
    pinterest: "",
    phone: "",
    address: "",
    privacy_policy: [],
  });
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios
      .get(BASE_API)
      .then((res) => setSettings(res.data))
      .catch((err) => console.log(err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    setLogoFile(e.target.files[0]);
  };

  const uploadLogo = async () => {
    if (!logoFile) return settings.appLogo;
    const formData = new FormData();
    formData.append("file", logoFile);
    const res = await axios.post(`${process.env.NEXT_PUBLIC_STORAGE_SERVER}/api/uploads`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.url;
  };

  // Privacy Policy handlers
  const addPolicyParagraph = () => {
    setSettings((prev) => ({
      ...prev,
      privacy_policy: [...prev.privacy_policy, { paragraph_heading: "", paragraph_text: "" }],
    }));
  };

  const handlePolicyChange = (index, field, value) => {
    const updated = [...settings.privacy_policy];
    updated[index][field] = value;
    setSettings((prev) => ({ ...prev, privacy_policy: updated }));
  };

  const removePolicyParagraph = (index) => {
    const updated = [...settings.privacy_policy];
    updated.splice(index, 1);
    setSettings((prev) => ({ ...prev, privacy_policy: updated }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const logoUrl = await uploadLogo();
      const payload = { ...settings, appLogo: logoUrl };
      await axios.put(BASE_API, payload);
      alert("Settings saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>App Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general">
            <TabsList className="mb-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general" className="space-y-4">
              <div>
                <Label>App Name</Label>
                <Input name="appName" value={settings.appName} onChange={handleChange} />
              </div>
              <div>
                <Label>App Version</Label>
                <Input name="appVersion" value={settings.appVersion} onChange={handleChange} />
              </div>
              <div>
                <Label>Environment</Label>
                <Select value={settings.enviroment} onValueChange={(val) => setSettings(prev => ({ ...prev, enviroment: val }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-4">
                <div>
                  <Label>Primary Color</Label>
                  <Input type="color" name="primaryColor" value={settings.primaryColor} onChange={handleChange} />
                </div>
                <div>
                  <Label>Secondary Color</Label>
                  <Input type="color" name="secondaryColor" value={settings.secondaryColor} onChange={handleChange} />
                </div>
              </div>
              <div>
                <Label>App Logo</Label>
                <Input type="file" accept="image/*" onChange={handleLogoChange} />
                {settings.appLogo && <img src={settings.appLogo} alt="App Logo" className="mt-2 h-16" />}
              </div>
              <div>
                <Label>Social Links</Label>
                <Input name="facebook" placeholder="Facebook URL" value={settings.facebook} onChange={handleChange} className="mt-1" />
                <Input name="instagram" placeholder="Instagram URL" value={settings.instagram} onChange={handleChange} className="mt-1" />
                <Input name="linkedin" placeholder="LinkedIn URL" value={settings.linkedin} onChange={handleChange} className="mt-1" />
                <Input name="twitter" placeholder="Twitter URL" value={settings.twitter} onChange={handleChange} className="mt-1" />
                <Input name="pinterest" placeholder="Pinterest URL" value={settings.pinterest} onChange={handleChange} className="mt-1" />
              </div>
              <div>
                <Label>Contact</Label>
                <Input name="phone" placeholder="+CountryCode Phone" value={settings.phone} onChange={handleChange} className="mt-1" />
                <Textarea name="address" placeholder="Address" value={settings.address} onChange={handleChange} className="mt-1" />
              </div>
            </TabsContent>

            {/* Privacy Policy Tab */}
            <TabsContent value="privacy" className="space-y-4">
              {settings.privacy_policy.map((para, idx) => (
                <div key={idx} className="border p-4 rounded-md space-y-2 relative">
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={() => removePolicyParagraph(idx)}
                  >
                    Remove
                  </Button>
                  <Input
                    placeholder="Paragraph Heading"
                    value={para.paragraph_heading}
                    onChange={(e) => handlePolicyChange(idx, "paragraph_heading", e.target.value)}
                  />
                  <Textarea
                    placeholder="Paragraph Text"
                    value={para.paragraph_text}
                    onChange={(e) => handlePolicyChange(idx, "paragraph_text", e.target.value)}
                  />
                </div>
              ))}
              <Button variant="outline" onClick={addPolicyParagraph}>Add Paragraph</Button>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Settings"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}