// app/(admin)/store-settings/page.js
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

const BASE_API = `https://api.arcdatumcode.info/api/store/settings`;

export default function StoreSettingsPage() {
  const [settings, setSettings] = useState({
    appName: "",
    appLogo: "",
    enviroment: "development",
    primaryColor: "#000000",
    secondaryColor: "#ffffff",
    appVersion: "",
    footer_text: "",
    company_text: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    twitter: "",
    pinterest: "",
    phone: "",
    address: "",
    privacy_policy: [],
    about_us: [],
    terms_of_service: [],
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
    const res = await axios.post(`${process.env.NEXT_PUBLIC_STORAGE_URL}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.url;
  };

  // Helpers for dynamic sections
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

  const addAboutBlock = () => {
    setSettings((prev) => ({
      ...prev,
      about_us: [...prev.about_us, { block_type: "Text", title: "", value: "" }],
    }));
  };
  const handleAboutChange = (index, field, value) => {
    const updated = [...settings.about_us];
    updated[index][field] = value;
    setSettings((prev) => ({ ...prev, about_us: updated }));
  };
  const removeAboutBlock = (index) => {
    const updated = [...settings.about_us];
    updated.splice(index, 1);
    setSettings((prev) => ({ ...prev, about_us: updated }));
  };

  const addTermParagraph = () => {
    setSettings((prev) => ({
      ...prev,
      terms_of_service: [...prev.terms_of_service, { paragraph_heading: "", paragraph_text: "" }],
    }));
  };
  const handleTermChange = (index, field, value) => {
    const updated = [...settings.terms_of_service];
    updated[index][field] = value;
    setSettings((prev) => ({ ...prev, terms_of_service: updated }));
  };
  const removeTermParagraph = (index) => {
    const updated = [...settings.terms_of_service];
    updated.splice(index, 1);
    setSettings((prev) => ({ ...prev, terms_of_service: updated }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const logoUrl = await uploadLogo();
      const payload = { ...settings, appLogo: logoUrl };
      await axios.put(BASE_API, payload);
      alert("Store settings saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Store Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general">
            <TabsList className="mb-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
              <TabsTrigger value="about">About Us</TabsTrigger>
              <TabsTrigger value="terms">Terms of Service</TabsTrigger>
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
                <Label>Footer Text</Label>
                <Input name="footer_text" value={settings.footer_text} onChange={handleChange} />
              </div>
              <div>
                <Label>Company Text</Label>
                <Input name="company_text" value={settings.company_text} onChange={handleChange} />
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

            {/* About Us Tab */}
            <TabsContent value="about" className="space-y-4">
              {settings.about_us.map((block, idx) => (
                <div key={idx} className="border p-4 rounded-md space-y-2 relative">
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={() => removeAboutBlock(idx)}
                  >
                    Remove
                  </Button>
                  <Select value={block.block_type} onValueChange={(val) => handleAboutChange(idx, "block_type", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Block Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Text">Text</SelectItem>
                      <SelectItem value="Media">Media</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Title"
                    value={block.title}
                    onChange={(e) => handleAboutChange(idx, "title", e.target.value)}
                  />
                  {block.block_type === "Text" ? (
                    <Textarea
                      placeholder="Value"
                      value={block.value}
                      onChange={(e) => handleAboutChange(idx, "value", e.target.value)}
                    />
                  ) : (
                    <Input
                      placeholder="Media URL"
                      value={block.value}
                      onChange={(e) => handleAboutChange(idx, "value", e.target.value)}
                    />
                  )}
                </div>
              ))}
              <Button variant="outline" onClick={addAboutBlock}>Add Block</Button>
            </TabsContent>

            {/* Terms of Service Tab */}
            <TabsContent value="terms" className="space-y-4">
              {settings.terms_of_service.map((para, idx) => (
                <div key={idx} className="border p-4 rounded-md space-y-2 relative">
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={() => removeTermParagraph(idx)}
                  >
                    Remove
                  </Button>
                  <Input
                    placeholder="Paragraph Heading"
                    value={para.paragraph_heading}
                    onChange={(e) => handleTermChange(idx, "paragraph_heading", e.target.value)}
                  />
                  <Textarea
                    placeholder="Paragraph Text"
                    value={para.paragraph_text}
                    onChange={(e) => handleTermChange(idx, "paragraph_text", e.target.value)}
                  />
                </div>
              ))}
              <Button variant="outline" onClick={addTermParagraph}>Add Paragraph</Button>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Store Settings"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
