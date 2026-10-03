import { getUserLocation } from "@/utils/location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import {
  DrawerActions,
  useNavigation,
} from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";

import { useRouter } from "expo-router";

import { useEffect, useState } from "react";

import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import WalletButton from "../../components/WalletButton";

import {
  getCategories,
  getCities,
  getStates,
  getSubCategories,
  registerProvider
} from "../../api/api";

export default function RegisterProvider() {
  const router = useRouter();

  const navigation =
    useNavigation<any>();

  const [categories, setCategories] =
    useState<any[]>([]);
    
    const [states,
  setStates] =
  useState<any[]>([]);

const [cities,
  setCities] =
  useState<any[]>([]);

 const [subCategories,
  setSubCategories] =
  useState<any[]>([]);
 

  const [form, setForm] =
  useState({

    business_name: "",

    address: "",

    city: "",

    state: "",

 icon_url: null,
banner_image: null,

    latitude: "",

    longitude: "",

    working_hours: "",

    working_from: "",

    working_to: "",

    phone: "",

    email: "",

    tags: "",

    category_id: "",

    sub_category_id: "",

    is_24x7_available: 0,

  });

  useEffect(() => {
    loadCategories();
  loadStates();
  }, []);

  const loadCategories =
    async () => {
      try {
        const res =
          await getCategories();

        setCategories(
          res.data.data || []
        );
      } catch (e) {
        console.log(
          "Category error:",
          e
        );
      }
    };

    const loadSubCategories =
  async (
    categoryId: any
  ) => {

    try {

      const res =
        await getSubCategories(
          categoryId
        );

      setSubCategories(
        res.data.data || []
      );

    } catch (e) {

      console.log(e);

    }

  };

  const loadStates =
  async () => {

    try {

      const res =
        await getStates();

      setStates(
        res.data.data || []
      );

    } catch (e) {

      console.log(e);

    }

  };


  const loadCities =
  async (
    stateId: any
  ) => {

    try {

      const res =
        await getCities(
          stateId
        );

      setCities(
        res.data.data || []
      );

    } catch (e) {

      console.log(e);

    }

  };

  const pickImage =
  async (
    field:
      | "icon_url"
      | "banner_image"
  ) => {

    try {

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (
        !permission.granted
      ) {

        Alert.alert(
          "Permission denied"
        );

        return;

      }

      const result =
        await ImagePicker.launchImageLibraryAsync(
          {
            mediaTypes: [
              "images",
            ],

            allowsEditing:
              true,

            aspect:
              field ===
              "banner_image"
                ? [16, 9]
                : [1, 1],

            quality: 0.4,
          }
        );

      if (
        !result.canceled
      ) {

        const asset =
          result.assets[0];

        setForm({

          ...form,

          [field]: {
            uri: asset.uri,
          },

        });

      }

    } catch (e) {

      console.log(e);

    }

  };


  const getLocation =
  async () => {

    const location =
      await getUserLocation();

    if (!location) {

      Alert.alert(
        "Location permission denied"
      );

      return;

    }

    setForm({

      ...form,

      latitude:
        location.lat.toString(),

      longitude:
        location.lng.toString(),

    });

    Alert.alert(
      "Location fetched"
    );

  };

  const handleSubmit =
    async () => {
      const user = JSON.parse(
        (await AsyncStorage.getItem(
          "user"
        )) || "{}"
      );

      if (!user?.id) {
        alert("Login required");
        return;
      }

      if (!form.category_id) {
        alert(
          "Please select category"
        );
        return;
      }

      const res =
        await registerProvider({
          ...form,
          user_id: user.id,
        });

      alert(res.data.message);

      if (res.data.status) {
        router.back();
      }
    };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
      />

      {/* HEADER */}

      <View style={styles.topHeader}>
        <View style={styles.topRow}>
          <TouchableOpacity
            onPress={() =>
              navigation.dispatch(
                DrawerActions.openDrawer()
              )
            }
          >
            <Text style={styles.menu}>
              ☰ Register Business
            </Text>
          </TouchableOpacity>

          <WalletButton />
        </View>

        <Text style={styles.subTitle}>
          Grow your business with
          Nearby
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={{
          paddingBottom: 50,
        }}
      >
        <View style={styles.formCard}>
          {/* BUSINESS NAME */}

          <Text style={styles.label}>
            Business Name
          </Text>

          <TextInput
            placeholder="Enter Business Name"
            placeholderTextColor="#999"
            style={styles.input}
            onChangeText={(t) =>
              setForm({
                ...form,
                business_name: t,
              })
            }
          />

          {/* ADDRESS */}

          <Text style={styles.label}>
            Address
          </Text>

          <TextInput
            placeholder="Enter Address"
            placeholderTextColor="#999"
            multiline
            style={[
              styles.input,
              {
                height: 90,
                textAlignVertical:
                  "top",
              },
            ]}
            onChangeText={(t) =>
              setForm({
                ...form,
                address: t,
              })
            }
          />

          {/* PHONE */}

          <Text style={styles.label}>
            Phone Number
          </Text>

          <TextInput
            placeholder="Enter Phone Number"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            style={styles.input}
            onChangeText={(t) =>
              setForm({
                ...form,
                phone: t,
              })
            }
          />

          {/* CATEGORY */}

          <Text style={styles.label}>
            Select Category
          </Text>

          <View style={styles.pickerWrapper}>

  <Picker
    selectedValue={
      form.category_id
    }

    dropdownIconColor="#111"

    style={{
      color: "#111827",
    }}

    onValueChange={(
      val
    ) => {

      setForm({
        ...form,
        category_id: val,
        sub_category_id: "",
      });

      loadSubCategories(val);

    }}
  >

    <Picker.Item
      label="Choose Category"
      value=""
    />

    {categories.map(
      (cat) => (

        <Picker.Item
          key={cat.category_id}
          label={cat.name}
          value={cat.category_id}
        />

      )
    )}

  </Picker>

</View>

<Text style={styles.label}>
  Select Service
</Text>

<View style={styles.pickerWrapper}>

  <Picker
    selectedValue={
      form.sub_category_id
    }

    dropdownIconColor="#111"

    style={{
      color: "#111827",
    }}

    onValueChange={(val) =>
      setForm({
        ...form,
        sub_category_id: val,
      })
    }
  >

    <Picker.Item
      label="Choose Service"
      value=""
    />

    {subCategories.map(
      (sub) => (

        <Picker.Item
          key={
            sub.sub_category_id
          }
          label={sub.name}
          value={
            sub.sub_category_id
          }
        />

      )
    )}

  </Picker>

</View>


{/* EMAIL */}

<Text style={styles.label}>
  Email
</Text>

<TextInput
  placeholder="Enter Email"
  placeholderTextColor="#999"
  keyboardType="email-address"
  style={styles.input}
  onChangeText={(t) =>
    setForm({
      ...form,
      email: t,
    })
  }
/>

 

 
 <Text style={styles.label}>
  Select State
</Text>

<View style={styles.pickerWrapper}>

  <Picker
    selectedValue={form.state}

    dropdownIconColor="#111"

    style={{
      color: "#111827",
    }}

    onValueChange={(val) => {

      const selected =
        states.find(
          (s) => s.id === val
        );

      setForm({

        ...form,

        state: val,

        
        city: "",
        

      });

      loadCities(val);

    }}
  >

    <Picker.Item
      label="Choose State"
      value=""
    />

    {states.map((item) => (

      <Picker.Item
        key={item.id}
        label={item.name}
        value={item.id}
      />

    ))}

  </Picker>

</View>
 

 <Text style={styles.label}>
  Select City
</Text>

<View style={styles.pickerWrapper}>

  <Picker
    selectedValue={form.city}

    dropdownIconColor="#111"

    style={{
      color: "#111827",
    }}

    onValueChange={(val) => {

      const selected =
        cities.find(
          (c) => c.id === val
        );

      setForm({

        ...form,

        city: val,
 

      });

    }}
  >

    <Picker.Item
      label="Choose City"
      value=""
    />

    {cities.map((item) => (

      <Picker.Item
        key={item.id}
        label={item.name}
        value={item.id}
      />

    ))}

  </Picker>

</View>

 
{/* TAGS */}

<Text style={styles.label}>
  Tags
</Text>

<TextInput
  placeholder="doctor, clinic, dentist"
  placeholderTextColor="#999"
  style={styles.input}
  onChangeText={(t) =>
    setForm({
      ...form,
      tags: t,
    })
  }
/>

{/* WORKING FROM */}

<Text style={styles.label}>
  Working From
</Text>

<TextInput
  placeholder="09:00 AM"
  placeholderTextColor="#999"
  style={styles.input}
  onChangeText={(t) =>
    setForm({
      ...form,
      working_from: t,
    })
  }
/>

{/* WORKING TO */}

<Text style={styles.label}>
  Working To
</Text>

<TextInput
  placeholder="08:00 PM"
  placeholderTextColor="#999"
  style={styles.input}
  onChangeText={(t) =>
    setForm({
      ...form,
      working_to: t,
    })
  }
/>


<TouchableOpacity

  style={styles.checkRow}

  onPress={() =>

    setForm({

      ...form,

      is_24x7_available:
        form.is_24x7_available
          ? 0
          : 1,

    })

  }
>

  <View
    style={[

      styles.checkbox,

      form.is_24x7_available
        ? styles.checkedBox
        : {},

    ]}
  />

  <Text style={styles.checkText}>
    Available 24x7
  </Text>

</TouchableOpacity>
          {/* BUTTON */}

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
          >
            <Text
              style={
                styles.buttonText
              }
            >
              Register Now 🚀
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },

  /* HEADER */

  topHeader: {
    backgroundColor: "#F97316",
    padding: 18,
    paddingTop: 50,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 20,
  },

  topRow: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
  },

  menu: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },

  subTitle: {
    color: "#fff",
    marginTop: 10,
    fontSize: 14,
    opacity: 0.9,
  },

  /* FORM */

  formCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 20,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.05,
    shadowRadius: 4,

    elevation: 3,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    marginTop: 10,
  },

  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    fontSize: 15,
    color: "#111827",
  },

  pickerWrapper: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 2,
  },

  button: {
    backgroundColor: "#F97316",
    height: 56,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  checkRow: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 20,
},

checkbox: {
  width: 22,
  height: 22,
  borderRadius: 6,
  borderWidth: 2,
  borderColor: "#F97316",
  marginRight: 10,
},

checkedBox: {
  backgroundColor: "#F97316",
},

checkText: {
  fontSize: 14,
  fontWeight: "600",
  color: "#111827",
},
});