import { HUBS, ORIGIN } from "./hubs";

/* India's states and union territories, and the state each well-known city is
   in — for the truck attachment form, where the State field fills itself from
   the operating city (Surat → Gujarat). Read through `stateForCity`
   (src/lib/places.ts).

   The city list covers the network's own hubs (src/content/hubs.ts) and the
   main cities and transport towns of every state, with their common older or
   alternate spellings (Bombay, Baroda, Gurgaon, Trichy …). A name that is a
   city in more than one state (Aurangabad, Bilaspur, Hamirpur …) is listed in
   `AMBIGUOUS_CITIES` and never fills the state by itself: the owner chooses. */

/** The 28 states and 8 union territories, as the State field lists them. */
export const INDIAN_STATES: readonly string[] = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

/** Cities by state, `|`-separated to keep the list readable. */
const CITIES_BY_STATE: Readonly<Record<string, string>> = {
  "Andhra Pradesh":
    "Visakhapatnam|Vizag|Vijayawada|Guntur|Nellore|Kurnool|Tirupati|Kakinada|Rajahmundry|Rajamahendravaram|Kadapa|Anantapur|Anantapuramu|Eluru|Ongole|Vizianagaram|Srikakulam|Chittoor|Machilipatnam|Bhimavaram|Tenali|Proddatur|Hindupur|Adoni|Nandyal|Tadepalligudem|Amaravati|Gudivada|Narasaraopet|Dharmavaram",
  "Arunachal Pradesh": "Itanagar|Naharlagun|Pasighat|Tawang",
  Assam:
    "Guwahati|Silchar|Dibrugarh|Jorhat|Nagaon|Tinsukia|Tezpur|Bongaigaon|Dhubri|Diphu|Goalpara|Karimganj|Sivasagar|North Lakhimpur|Golaghat|Barpeta",
  Bihar:
    "Patna|Gaya|Bhagalpur|Muzaffarpur|Darbhanga|Purnia|Arrah|Ara|Begusarai|Katihar|Munger|Chhapra|Hajipur|Sasaram|Dehri|Bettiah|Motihari|Siwan|Gopalganj|Samastipur|Madhubani|Sitamarhi|Bihar Sharif|Biharsharif|Nalanda|Buxar|Jehanabad|Nawada|Kishanganj|Lakhisarai|Saharsa|Supaul|Araria|Forbesganj|Bagaha|Raxaul|Jamui|Sheikhpura|Khagaria|Madhepura|Bhabua|Bodh Gaya",
  Chhattisgarh:
    "Raipur|Bhilai|Durg|Korba|Raigarh|Rajnandgaon|Jagdalpur|Ambikapur|Dhamtari|Mahasamund|Kanker|Kawardha|Janjgir|Champa|Naya Raipur|Atal Nagar",
  Goa: "Panaji|Panjim|Margao|Madgaon|Vasco da Gama|Vasco|Mapusa|Ponda",
  Gujarat:
    "Ahmedabad|Surat|Vadodara|Baroda|Rajkot|Bhavnagar|Jamnagar|Junagadh|Gandhinagar|Anand|Nadiad|Navsari|Valsad|Vapi|Bharuch|Ankleshwar|Mehsana|Palanpur|Morbi|Gandhidham|Bhuj|Porbandar|Godhra|Dahod|Surendranagar|Amreli|Veraval|Botad|Patan|Himmatnagar|Kalol|Halol|Bardoli|Vyara|Kim|Olpad|Sachin|Kadodara|Palsana|Mandvi|Mundra|Kandla|Dwarka|Gondal|Jetpur|Upleta|Dhoraji|Unjha|Sanand|Bavla|Dholka|Deesa|Modasa|Lunawada|Chhota Udaipur|Rajpipla|Umbergaon|Pardi|Bilimora|Chikhli|Songadh|Kamrej|Hazira|Pipavav|Sidhpur|Visnagar|Keshod|Wankaner",
  Haryana:
    "Gurgaon|Gurugram|Faridabad|Panipat|Ambala|Karnal|Sonipat|Sonepat|Rohtak|Hisar|Hissar|Yamunanagar|Panchkula|Bhiwani|Sirsa|Jind|Kaithal|Kurukshetra|Rewari|Dharuhera|Bahadurgarh|Palwal|Manesar|Narnaul|Jhajjar|Nuh|Mahendragarh|Charkhi Dadri|Kundli|Sohna",
  "Himachal Pradesh":
    "Shimla|Solan|Baddi|Nalagarh|Mandi|Kullu|Manali|Dharamshala|Kangra|Una|Paonta Sahib|Nahan|Chamba|Parwanoo|Palampur",
  Jharkhand:
    "Ranchi|Jamshedpur|Dhanbad|Bokaro|Bokaro Steel City|Deoghar|Hazaribagh|Giridih|Ramgarh|Daltonganj|Medininagar|Garhwa|Chaibasa|Dumka|Phusro|Chas|Sahibganj|Pakur|Godda|Koderma|Jhumri Telaiya|Lohardaga|Gumla|Simdega|Chatra|Latehar|Adityapur|Kirkend Bazar",
  Karnataka:
    "Bengaluru|Bangalore|Mysuru|Mysore|Mangaluru|Mangalore|Hubballi|Hubli|Dharwad|Hubli-Dharwad|Belagavi|Belgaum|Kalaburagi|Gulbarga|Ballari|Bellary|Vijayapura|Bijapur|Shivamogga|Shimoga|Tumakuru|Tumkur|Davanagere|Davangere|Udupi|Hassan|Mandya|Chitradurga|Raichur|Bidar|Hosapete|Hospet|Kolar|Chikkamagaluru|Karwar|Gadag|Bagalkot|Koppal|Ramanagara|Chikkaballapur|Nelamangala|Dandeli",
  Kerala:
    "Thiruvananthapuram|Trivandrum|Kochi|Cochin|Ernakulam|Kozhikode|Calicut|Thrissur|Trichur|Kollam|Quilon|Kannur|Cannanore|Palakkad|Palghat|Alappuzha|Alleppey|Kottayam|Malappuram|Kasaragod|Pathanamthitta|Idukki|Kalpetta|Thalassery|Perumbavoor|Aluva",
  "Madhya Pradesh":
    "Indore|Bhopal|Jabalpur|Gwalior|Ujjain|Sagar|Dewas|Ratlam|Satna|Rewa|Katni|Singrauli|Burhanpur|Khandwa|Khargone|Chhindwara|Shivpuri|Guna|Vidisha|Mandsaur|Neemuch|Morena|Bhind|Dhar|Pithampur|Itarsi|Hoshangabad|Narmadapuram|Betul|Seoni|Mandla|Balaghat|Damoh|Chhatarpur|Tikamgarh|Datia|Sehore|Raisen|Shahdol|Sidhi|Jhabua|Barwani|Harda|Mhow",
  Maharashtra:
    "Mumbai|Bombay|Pune|Poona|Nagpur|Nashik|Nasik|Thane|Navi Mumbai|Kalyan|Dombivli|Bhiwandi|Vasai|Virar|Panvel|Chhatrapati Sambhajinagar|Solapur|Sholapur|Kolhapur|Sangli|Satara|Ahmednagar|Ahilyanagar|Jalgaon|Dhule|Nandurbar|Malegaon|Akola|Amravati|Latur|Nanded|Parbhani|Jalna|Beed|Osmanabad|Dharashiv|Chandrapur|Wardha|Yavatmal|Gondia|Bhandara|Ratnagiri|Ichalkaranji|Baramati|Lonavala|Khopoli|Palghar|Boisar|Tarapur|Chakan|Pimpri|Chinchwad|Pimpri-Chinchwad|Ulhasnagar|Mira Road|Bhayandar|Shirdi|Sinnar|Igatpuri|JNPT|Nhava Sheva|Uran|Taloja",
  Manipur: "Imphal|Thoubal|Churachandpur",
  Meghalaya: "Shillong|Tura|Jowai",
  Mizoram: "Aizawl|Lunglei",
  Nagaland: "Kohima|Dimapur|Mokokchung",
  Odisha:
    "Bhubaneswar|Cuttack|Rourkela|Berhampur|Brahmapur|Sambalpur|Balasore|Baleshwar|Puri|Jharsuguda|Angul|Talcher|Dhenkanal|Paradip|Jajpur|Kendrapara|Bhadrak|Baripada|Jeypore|Koraput|Rayagada|Bargarh|Bolangir|Balangir|Keonjhar|Sundargarh",
  Punjab:
    "Ludhiana|Amritsar|Jalandhar|Jullundur|Patiala|Bathinda|Bhatinda|Mohali|SAS Nagar|Hoshiarpur|Pathankot|Moga|Firozpur|Ferozepur|Phagwara|Kapurthala|Abohar|Fazilka|Sangrur|Barnala|Khanna|Mandi Gobindgarh|Rajpura|Zirakpur|Batala|Gurdaspur|Muktsar|Sri Muktsar Sahib|Faridkot|Malerkotla|Nawanshahr|Ropar|Rupnagar|Dera Bassi",
  Rajasthan:
    "Jaipur|Jodhpur|Udaipur|Kota|Ajmer|Bikaner|Alwar|Bhilwara|Sikar|Bharatpur|Pali|Sri Ganganagar|Ganganagar|Hanumangarh|Churu|Jhunjhunu|Nagaur|Barmer|Jaisalmer|Tonk|Sawai Madhopur|Bundi|Chittorgarh|Banswara|Dungarpur|Beawar|Kishangarh|Bhiwadi|Neemrana|Balotra|Sirohi|Abu Road|Mount Abu|Jhalawar|Baran|Dholpur|Karauli|Dausa|Rajsamand|Nathdwara|Makrana|Sumerpur|Phalodi",
  Sikkim: "Gangtok|Namchi",
  "Tamil Nadu":
    "Chennai|Madras|Coimbatore|Madurai|Tiruchirappalli|Trichy|Salem|Tiruppur|Tirupur|Erode|Vellore|Thoothukudi|Tuticorin|Tirunelveli|Hosur|Thanjavur|Dindigul|Karur|Namakkal|Kanchipuram|Cuddalore|Nagercoil|Kanyakumari|Sivakasi|Pollachi|Krishnagiri|Dharmapuri|Kumbakonam|Ranipet|Ambur|Vaniyambadi|Sriperumbudur|Tiruvallur|Ooty|Udhagamandalam|Karaikudi|Rajapalayam|Virudhunagar|Pudukkottai|Nagapattinam|Ennore",
  Telangana:
    "Hyderabad|Secunderabad|Warangal|Hanamkonda|Karimnagar|Nizamabad|Khammam|Ramagundam|Mahbubnagar|Nalgonda|Adilabad|Suryapet|Siddipet|Mancherial|Kothagudem|Miryalaguda|Sangareddy|Zaheerabad|Medak|Shamshabad",
  Tripura: "Agartala|Dharmanagar",
  "Uttar Pradesh":
    "Lucknow|Kanpur|Agra|Varanasi|Banaras|Benares|Prayagraj|Allahabad|Ghaziabad|Noida|Greater Noida|Meerut|Aligarh|Moradabad|Bareilly|Gorakhpur|Jhansi|Mathura|Vrindavan|Firozabad|Saharanpur|Muzaffarnagar|Shahjahanpur|Rampur|Ayodhya|Faizabad|Etawah|Mainpuri|Etah|Kasganj|Hapur|Bulandshahr|Badaun|Budaun|Pilibhit|Sitapur|Hardoi|Unnao|Rae Bareli|Sultanpur|Amethi|Barabanki|Gonda|Bahraich|Basti|Deoria|Kushinagar|Padrauna|Maharajganj|Siddharthnagar|Ballia|Ghazipur|Mau|Azamgarh|Jaunpur|Mirzapur|Sonbhadra|Robertsganj|Chandauli|Mughalsarai|Bhadohi|Fatehpur|Banda|Chitrakoot|Mahoba|Lalitpur|Orai|Jalaun|Kannauj|Farrukhabad|Auraiya|Lakhimpur|Lakhimpur Kheri|Shamli|Bagpat|Baghpat|Amroha|Bijnor|Sambhal|Chandausi|Khurja|Tundla|Hathras|Ambedkar Nagar|Shravasti|Kaushambi|Sant Kabir Nagar|Khalilabad|Kanpur Dehat",
  Uttarakhand:
    "Dehradun|Haridwar|Roorkee|Rishikesh|Haldwani|Rudrapur|Kashipur|Kichha|Sitarganj|Nainital|Almora|Pithoragarh|Jwalapur|Kotdwar|Pantnagar",
  "West Bengal":
    "Kolkata|Calcutta|Howrah|Durgapur|Asansol|Siliguri|Kharagpur|Haldia|Bardhaman|Burdwan|Malda|English Bazar|Baharampur|Berhampore|Krishnanagar|Jalpaiguri|Cooch Behar|Bankura|Purulia|Midnapore|Medinipur|Raiganj|Balurghat|Barasat|Barrackpore|Serampore|Hooghly|Chinsurah|Bolpur|Darjeeling|Kalyani|Dankuni|Uluberia",
  "Andaman and Nicobar Islands": "Port Blair|Sri Vijaya Puram",
  Chandigarh: "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu": "Silvassa|Daman|Diu|Dadra",
  Delhi: "Delhi|New Delhi|Delhi NCR",
  "Jammu and Kashmir":
    "Jammu|Srinagar|Anantnag|Baramulla|Kathua|Udhampur|Samba|Sopore|Rajouri|Poonch|Katra",
  Ladakh: "Leh|Kargil",
  Lakshadweep: "Kavaratti",
  Puducherry: "Puducherry|Pondicherry|Karaikal",
};

/** City names found in more than one state: they never fill the state alone. */
export const AMBIGUOUS_CITIES: readonly string[] = [
  "Aurangabad",
  "Bilaspur",
  "Hamirpur",
  "Pratapgarh",
  "Balrampur",
  "Fatehabad",
  "Jalalabad",
  "Nawabganj",
  "Mohammadabad",
  "Ramnagar",
];

/** The hubs' state names, as the map data writes them → the official names. */
const HUB_STATE_NAMES: Readonly<Record<string, string>> = {
  "Delhi NCR": "Delhi",
  "Jammu & Kashmir": "Jammu and Kashmir",
};

/** Every known city with its state: the list above, then the network's hubs. */
export const CITY_STATES: readonly (readonly [city: string, state: string])[] = [
  ...Object.entries(CITIES_BY_STATE).flatMap(([state, cities]) =>
    cities.split("|").map((city) => [city, state] as const),
  ),
  ...[ORIGIN, ...HUBS].map((hub) => [hub.name, HUB_STATE_NAMES[hub.state] ?? hub.state] as const),
];
