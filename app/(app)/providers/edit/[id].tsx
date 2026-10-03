import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { getProviderDetail, updateProvider } from "../../../api/api";

export default function EditBusiness() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    provider_id: id,
    business_name: "",
    address: "",
    category_id: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await getProviderDetail(Number(id));

      if (res.data.status) {
        const data = res.data.data;

        setForm({
          provider_id: data.provider_id,
          business_name: data.business_name || "",
          address: data.address || "",
          category_id: data.category_id || "",
        });
      }
    } catch (e) {
      console.log("Error loading provider:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    const res = await updateProvider(form);

    if (res.data.status) {
      alert("Updated");
      router.back();
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      <Text>Business Name</Text>
      <TextInput
        value={form.business_name}
        onChangeText={(t) => setForm({ ...form, business_name: t })}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />

      <Text>Address</Text>
      <TextInput
        value={form.address}
        onChangeText={(t) => setForm({ ...form, address: t })}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />

      <TouchableOpacity onPress={handleUpdate}>
        <Text>Update</Text>
      </TouchableOpacity>
    </View>
  );
}
