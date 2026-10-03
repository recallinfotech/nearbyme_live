export interface DirectoryItem {
  id: string;
  title: string;
  subtitle: string;
  number: string;
  icon: string;
  type?: string;
  color: string;
  bg: string;
}

export const EMERGENCY_DATA: DirectoryItem[] = [
  // --- MAIN EMERGENCY & SECURITY ---
  { id: '1', title: 'Emergency Police (Latest)', subtitle: 'मुख्य पुलिस सहायता नंबर (New Unified)', number: '112', icon: 'Shield', color: '#BE123C', bg: '#FFE4E6' },
  { id: '2', title: 'Alternate Police Helpline', subtitle: 'पारंपरिक पुलिस सहायता नंबर (Old Number)', number: '100', icon: 'PhoneCall', color: '#1E40AF', bg: '#EFF6FF' },
  { id: '3', title: 'Medical Ambulance', subtitle: 'एम्बुलेंस आपातकालीन सेवा', number: '108', icon: 'CrossHand', color: '#EF4444', bg: '#FEF2F2' },
  { id: '4', title: 'Fire Brigade', subtitle: 'अग्निशमन विभाग', number: '101', icon: 'Flame', color: '#F97316', bg: '#FFF7ED' },

  // --- SPECIALIZED PROTECTION HELP ---
  { id: '5', title: 'Women Helpline', subtitle: 'महिला सुरक्षा हेल्पलाइन (National)', number: '1091', icon: 'ShieldAlert', color: '#EC4899', bg: '#FDF2F8' },
  { id: '6', title: 'Women In Distress', subtitle: 'घरेलू हिंसा / प्रताड़ना सहायता', number: '181', icon: 'HeartHandshake', color: '#DB2777', bg: '#FCE7F3' },
  { id: '7', title: 'Child Helpline', subtitle: 'बाल संरक्षण सहायता (Childline)', number: '1098', icon: 'Users', color: '#0D9488', bg: '#CCFBF1' },
  { id: '8', title: 'Elder Line (Senior Citizens)', subtitle: 'वरिष्ठ नागरिकों के लिए राष्ट्रीय हेल्पलाइन', number: '14567', icon: 'Award', color: '#4F46E5', bg: '#EEF2FF' },

  // --- CRIME & UTILITIES ---
  { id: '9', title: 'Cyber Crime Helpline', subtitle: 'साइबर धोखाधड़ी / ऑनलाइन फ्रॉड शिकायत', number: '1930', icon: 'Laptop', color: '#4F46E5', bg: '#EEF2FF' },
  { id: '10', title: 'Anti-Corruption Helpline', subtitle: 'भ्रष्टाचार विरोधी शिकायत सेल', number: '1064', icon: 'Eye', color: '#059669', bg: '#D1FAE5' },
  { id: '11', title: 'LPG Gas Leakage', subtitle: 'गैस लीकेज / इमरजेंसी रिस्पॉन्स', number: '1906', icon: 'AlertTriangle', color: '#7C3AED', bg: '#F3E8FF' },

  // --- ROAD & TRAFFIC EMERGENCY ---
  { id: '12', title: 'National Highway Accident', subtitle: 'NHAI रोड एक्सीडेंट हेल्पलाइन', number: '1033', icon: 'TrendingUp', color: '#059669', bg: '#D1FAE5' },
  { id: '13', title: 'Traffic Police Helpline', subtitle: 'यातायात समस्या / क्रेन सहायता', number: '1095', icon: 'Car', color: '#0284C7', bg: '#E0F2FE' },
  { id: '14', title: 'Railway Accident Information', subtitle: 'रेलवे आपातकालीन / दुर्घटना सहायता', number: '1072', icon: 'Train', color: '#D97706', bg: '#FEF3C7' },

  // --- DISASTER & MISC CUSTOMER CARE ---
  { id: '15', title: 'Disaster Management Services', subtitle: 'आपदा प्रबंधन राहत (NDRF)', number: '1070', icon: 'LifeBuoy', color: '#475569', bg: '#F1F5F9' },
  { id: '16', title: 'Aadhaar Card Helpline', subtitle: 'UIDAI आधिकारिक कस्टमर केयर', number: '1947', icon: 'Fingerprint', color: '#2563EB', bg: '#EFF6FF' },
];

export const OFFICERS_DATA: DirectoryItem[] = [
  // --- TOP ADMINISTRATION & POLICE ---
  { id: '1', title: 'DM (District Magistrate)', subtitle: 'जिलाधिकारी कार्यालय', number: '0562-2266060', icon: 'UserCheck', type: 'ion', color: '#059669', bg: '#D1FAE5' },
  { id: '2', title: 'CP (Commissioner of Police)', subtitle: 'पुलिस कमिश्नर कार्यालय', number: '0562-2421313', icon: 'Shield', type: 'ion', color: '#1E40AF', bg: '#EFF6FF' },
  { id: '3', title: 'SSP / SP City Office', subtitle: 'वरिष्ठ पुलिस अधीक्षक कार्यालय', number: '0562-2421204', icon: 'ShieldAlert', type: 'mat', color: '#1E40AF', bg: '#EFF6FF' },
  { id: '4', title: 'SDM (Sub-Divisional Magistrate)', subtitle: 'उप मंडल अधिकारी', number: '0562-2260550', icon: 'Scale', type: 'mat', color: '#7C3AED', bg: '#F3E8FF' },
  { id: '5', title: 'CO (Circle Officer - City)', subtitle: 'सर्कल ऑफिसर / पुलिस उपाधीक्षक', number: '0562-2261622', icon: 'BadgeCheck', type: 'mat', color: '#EA580C', bg: '#FFEDD5' },
  { id: '6', title: 'SHO POLICE (Main Kotwali)', subtitle: 'पुलिस स्टेशन कोतवाली प्रभारी', number: '0562-2421255', icon: 'Lock', type: 'mat', color: '#DC2626', bg: '#FEE2E2' },

  // --- MUNICIPAL, DEVELOPMENT & RTO ---
  { id: '7', title: 'MAYOR (Agra Municipal Corp.)', subtitle: 'महापौर / नगर निगम आगरा', number: '0562-2420804', icon: 'Building2', type: 'ion', color: '#D97706', bg: '#FEF3C7' },
  { id: '8', title: 'Municipal Commissioner (Nagar Aayukt)', subtitle: 'नगर आयुक्त कार्यालय', number: '0562-2421570', icon: 'MapPin', type: 'mat', color: '#0D9488', bg: '#CCFBF1' },
  { id: '9', title: 'ADA Vice Chairman (Agra Dev. Authority)', subtitle: 'आगरा विकास प्राधिकरण उपाध्यक्ष', number: '0562-2511877', icon: 'Building', type: 'mat', color: '#4F46E5', bg: '#EEF2FF' },
  { id: '10', title: 'RTO (Regional Transport Office)', subtitle: 'क्षेत्रीय परिवहन कार्यालय', number: '0562-2230198', icon: 'Car', type: 'mat', color: '#0284C7', bg: '#E0F2FE' },

  // --- PUBLIC UTILITIES, HEALTH & ESSENTIAL DEPARTMENTS ---
  { id: '11', title: 'CMO (Chief Medical Officer)', subtitle: 'मुख्य चिकित्सा अधिकारी (Agra Health)', number: '0562-2264696', icon: 'Activity', type: 'mat', color: '#EF4444', bg: '#FEF2F2' },
  { id: '12', title: 'UPPCL Executive Engineer (Torrent/Electricity)', subtitle: 'विद्युत विभाग मुख्य अभियंता कार्यालय', number: '0562-2421307', icon: 'Zap', type: 'ion', color: '#EAB308', bg: '#FEF9C3' },
  { id: '13', title: 'Jal Sansthan (Water Works Office)', subtitle: 'जल संस्थान मुख्य कार्यालय, आगरा', number: '0562-2521156', icon: 'Droplets', type: 'ion', color: '#2563EB', bg: '#EFF6FF' },
  { id: '14', title: 'BSAC Office (Basic Shiksha Adhikari)', subtitle: 'जिला बेसिक शिक्षा अधिकारी कार्यालय', number: '0562-2157451', icon: 'GraduationCap', type: 'mat', color: '#DB2777', bg: '#FCE7F3' },
  { id: '15', title: 'District Tourism Officer', subtitle: 'क्षेत्रीय पर्यटन कार्यालय, आगरा', number: '0562-2226431', icon: 'Compass', type: 'mat', color: '#059669', bg: '#D1FAE5' },
];
