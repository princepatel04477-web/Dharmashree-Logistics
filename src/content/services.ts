import type { Service } from "./types";

/* The catalogue (Prompts 06 and 09). `company.services` owns the *names* — this
   file owns everything a page says about them — so the two lists must stay
   one-for-one, in order (`npm run verify:services` fails if they drift). The
   footer column, the home tiles and the index rows are all built from this
   array, so a service added here appears in all three without a component
   changing.

   Copy follows the company profile (`Company_Profile/`): no rates, no transit
   hours, no fleet counts. Where a lane is named it is a hub from
   `src/content/hubs.ts`, and where a number would belong the sentence says what
   the desk does instead. */

export const services: Service[] = [
  {
    slug: "express-parcel",
    name: "Express parcel",
    summary: "Documents, e-commerce orders and business shipments, collected from your door.",
    headline: "Every parcel. Right place. Right time.",
    body: [
      "Express parcel delivers your documents, e-commerce orders and business shipments safely, on time and with complete reliability. Whether you dispatch daily customer orders, send important documents or manage bulk parcel movement, the focus is simple: handle every shipment with care and make the delivery process easier for you.",
      "Each consignment is managed according to its route, destination and service requirements, so a nearby city and a regional run are planned as what they are.",
    ],
    bullets: [
      "Doorstep pickup from your office, warehouse, store or fulfilment centre",
      "Planned intercity and regional delivery",
      "Tracking support to follow parcel movement and delivery status",
      "B2B consignments to business locations, distributors and retail partners",
      "B2C and e-commerce orders direct to the customer",
      "Flexible support for bulk parcel requirements",
    ],
    bestFor: [
      "Important documents",
      "E-commerce orders dispatched every day",
      "Parcels to distributors and retail partners",
      "Several shipments planned and moved together",
      "Online businesses, retailers, manufacturers and distributors",
    ],
    vehicles: [],
    sections: [
      {
        title: "Doorstep pickup for business shipments",
        body: [
          "You do not need to take your shipments to a drop-off point. Prepare parcels at your office, warehouse, store or fulfilment centre while the pickup coordination team supports the collection process.",
          "This helps businesses manage regular dispatches, reduce operational effort and process customer orders more quickly.",
        ],
      },
      {
        title: "Shipment tracking for better visibility",
        body: [
          "Once a shipment is dispatched, tracking support helps you monitor parcel movement and understand its delivery status.",
          "That makes it easier to respond to customer enquiries, keep internal teams informed and improve shipment planning.",
        ],
      },
    ],
    showLanes: true,
    questions: [
      {
        question: "Do I have to bring parcels to a drop-off point?",
        answer:
          "No. Pickup is from your business location, whether that is an office, warehouse, store or fulfilment centre.",
      },
      {
        question: "Can I send parcels in bulk?",
        answer:
          "Yes. Bulk parcel requirements are supported, so multiple shipments can be planned and managed together.",
      },
      {
        question: "How do I follow a parcel after it leaves?",
        answer:
          "Use the Track page with your AWB, LR or tracking number. Tracking support shows the latest available status of the shipment.",
      },
    ],
    signature: {
      kind: "journey",
      title: "From your door to theirs",
      lede: "The four moments every express parcel goes through.",
      stops: [
        {
          title: "Your door",
          body: "Parcels are prepared at your office, warehouse, store or fulfilment centre.",
        },
        {
          title: "Pickup",
          body: "The pickup coordination team supports collection from your location.",
        },
        {
          title: "In transit",
          body: "Each consignment moves according to its route, destination and service requirement.",
        },
        {
          title: "Delivered",
          body: "Tracking support shows the delivery status, so enquiries are easy to answer.",
        },
      ],
      segmentsLabel: "What are you sending?",
      segments: [
        {
          id: "b2b",
          label: "B2B",
          title: "Business to business",
          body: "Consignments move to business locations, distributors and retail partners.",
        },
        {
          id: "b2c",
          label: "B2C",
          title: "Business to customer",
          body: "E-commerce and direct-to-customer orders, delivered to the buyer.",
        },
        {
          id: "bulk",
          label: "Bulk",
          title: "Bulk parcels",
          body: "Flexible support for bulk requirements, so multiple shipments can be planned and managed together.",
        },
      ],
    },
  },
  {
    slug: "full-truckload",
    name: "Full truckload",
    summary: "A dedicated vehicle for large shipments, factory dispatches and planned movement.",
    headline: "Your dedicated truck. Your planned movement.",
    body: [
      "For large shipments, factory dispatches and dedicated business movement, Full truckload provides dependable road-freight support. When your cargo requires an entire vehicle, you get a transport solution planned around your business needs.",
      "From pickup to delivery, your shipment is moved with focused coordination, helping you manage larger volumes with greater efficiency and confidence.",
    ],
    bullets: [
      "A dedicated vehicle planned for your cargo, route and delivery requirements",
      "No space shared with unrelated consignments",
      "Better control over loading, movement schedules and delivery planning",
      "Road freight across cities, regions and major business routes",
      "Regular contract arrangements for recurring movement",
      "Structured planning for manufacturing and retail distribution",
    ],
    bestFor: [
      "Large quantities of goods in one movement",
      "Time-sensitive stock that needs direct coordination",
      "Finished goods dispatched from a factory",
      "Retail stock replenishment and distribution-centre transfers",
      "Companies moving goods between fixed locations on a schedule",
    ],
    vehicles: ["19 ft mxl", "32 ft multi-axle", "Open-body lorry"],
    sections: [
      {
        title: "Long-distance transport",
        body: [
          "Long-distance cargo movement requires careful planning, dependable coordination and clear communication. Full truckload supports road freight across cities, regions and major business routes.",
          "By planning the vehicle, route and shipment schedule around your requirements, large consignments travel longer distances with greater ease — useful for organisations expanding into new markets, servicing multiple locations or managing regular intercity distribution.",
        ],
      },
      {
        title: "Regular contract logistics support",
        body: [
          "For businesses with recurring transport needs, regular Full truckload support can be part of a planned logistics arrangement. It suits companies that frequently move goods between fixed locations such as factories, warehouses, distributors, retail outlets or project sites.",
          "A regular arrangement improves consistency, simplifies planning and gives better control over ongoing freight, so your team can focus less on arranging individual shipments.",
        ],
      },
    ],
    showLanes: true,
    questions: [
      {
        question: "What does a dedicated vehicle mean?",
        answer:
          "The truck is planned specifically for your cargo, route and delivery requirements, without sharing space with unrelated consignments.",
      },
      {
        question: "Can I arrange regular truckloads?",
        answer:
          "Yes. Recurring needs can be set up as a planned logistics arrangement between fixed locations such as factories, warehouses, distributors, retail outlets or project sites.",
      },
      {
        question: "Do you cover long distances?",
        answer:
          "Yes. Road freight is supported across cities, regions and major business routes, with the vehicle, route and schedule planned around your requirements.",
      },
    ],
    signature: {
      kind: "dedicated",
      title: "One truck, one plan",
      lede: "Switch between a shared body and a dedicated one.",
      toggleLabel: "How is the vehicle used?",
      dedicated: {
        id: "dedicated",
        label: "Dedicated",
        title: "A truck planned for your cargo",
        body: "The vehicle is planned specifically for your cargo, route and delivery requirements, without sharing space with unrelated consignments.",
      },
      shared: {
        id: "shared",
        label: "Shared",
        title: "A body shared with other consignments",
        body: "Space is divided among several unrelated consignments. Full truckload is the alternative when you need control over loading, movement schedules and delivery planning.",
      },
      figureCaption:
        "An outline of a truck body. In the shared view it holds several consignments; in the dedicated view it holds only yours.",
      flowTitle: "Manufacturing and retail distribution",
      flow: [
        {
          title: "Factory dispatch",
          body: "Finished goods leave the factory on a vehicle planned for them.",
        },
        {
          title: "Warehouse and distribution centre",
          body: "Inventory moves to a distribution centre to keep the supply chain active.",
        },
        {
          title: "Distributors and partners",
          body: "Products are supplied to business partners where they are needed.",
        },
        {
          title: "Retail stock",
          body: "Retail stock is replenished so products stay available in stores.",
        },
      ],
    },
  },
  {
    slug: "local-on-demand",
    name: "Local on-demand delivery",
    summary: "Quick point-to-point delivery of urgent documents, parcels, inventory and supplies.",
    headline: "Fast delivery across the city, whenever you need it.",
    body: [
      "Local on-demand delivery is quick, point-to-point support for urgent documents, parcels, inventory and business supplies. When a shipment needs to move within the city without delay, you can arrange dependable transport at the right time.",
      "Send an important document to a client, move stock between stores, deliver a customer order or arrange urgent business supplies — local movement made simpler, faster and easier to manage.",
    ],
    bullets: [
      "Same-day pickup and delivery for eligible intra-city requirements",
      "Pickup coordinated from your office, warehouse, store or business location",
      "Shipments moved directly towards the destination",
      "Vehicle chosen by shipment size, weight and movement requirement",
      "Both scheduled and urgent requests supported",
      "Recurring local movement planned around your business",
    ],
    bestFor: [
      "A document that must reach a client today",
      "Stock moving between stores",
      "A customer order that cannot wait",
      "Urgent business supplies",
      "Stores, offices, warehouses and service teams with repeat needs",
    ],
    vehicles: ["Two-wheeler", "12 ft pickup", "Three-wheeler load carrier"],
    sections: [
      {
        title: "Same-day local pickup and delivery",
        body: [
          "A delayed document, parcel or stock transfer can affect customer service, operations and business commitments. Same-day pickup and delivery is available for eligible intra-city requirements.",
          "Once your shipment is ready, pickup is coordinated from your location and the shipment moves directly towards its destination.",
        ],
      },
      {
        title: "Support for repeat requirements",
        body: [
          "Businesses that regularly move documents, parcels, inventory or supplies within the city need a partner they can depend on repeatedly. Recurring local movement is supported for stores, offices, warehouses, distributors, service teams and other business locations.",
          "Whether you need local delivery every day, several times a week or at specific intervals, a practical movement plan can be built around your business.",
        ],
      },
    ],
    showLanes: false,
    questions: [
      {
        question: "Is same-day delivery available?",
        answer:
          "Same-day pickup and delivery is supported for eligible intra-city requirements. Tell the desk what is moving and where, and they will confirm what is available.",
      },
      {
        question: "What vehicle will my shipment need?",
        answer:
          "That depends on its size, weight and movement requirement. A document or small parcel may need a two-wheeler; cartons, inventory or business supplies may need a larger vehicle.",
      },
      {
        question: "Can I set up deliveries that repeat?",
        answer:
          "Yes. Local delivery can be arranged every day, several times a week or at specific intervals, with a movement plan suited to your business.",
      },
    ],
    signature: {
      kind: "selector",
      title: "What are you sending?",
      lede: "Pick the load and see the kind of vehicle it calls for.",
      questionLabel: "I am sending",
      vehicleLabel: "Vehicle",
      options: [
        {
          id: "document",
          label: "A document",
          title: "A document",
          body: "A small document is typically a two-wheeler job.",
          vehicle: "Two-wheeler",
        },
        {
          id: "parcel",
          label: "A parcel",
          title: "A small parcel",
          body: "A small parcel is typically a two-wheeler job.",
          vehicle: "Two-wheeler",
        },
        {
          id: "cartons",
          label: "Cartons",
          title: "Cartons",
          body: "Cartons usually need a larger vehicle than a two-wheeler.",
          vehicle: "A larger vehicle",
        },
        {
          id: "inventory",
          label: "Inventory or supplies",
          title: "Inventory or business supplies",
          body: "Inventory and business supplies usually need a larger vehicle, chosen by weight and volume.",
          vehicle: "A larger vehicle",
        },
      ],
      modesLabel: "When does it have to move?",
      modes: [
        {
          id: "scheduled",
          label: "Scheduled",
          title: "Planned in advance",
          body: "Plan pickups and drop-offs around your daily operations.",
        },
        {
          id: "urgent",
          label: "Urgent",
          title: "Needed now",
          body: "When time is critical, faster movement is coordinated for you.",
        },
      ],
    },
  },
  {
    slug: "warehousing-fulfilment",
    name: "Warehousing & fulfilment",
    summary: "Store, organise and fulfil your products with one trusted partner.",
    headline: "From storage to delivery, with one trusted partner.",
    body: [
      "Warehousing & fulfilment helps businesses store, organise and fulfil their products efficiently, so you can focus on growing your business while the movement behind it is supported.",
      "Whether you are an e-commerce seller, retailer, distributor or manufacturer, effective warehousing and fulfilment can simplify your operations: manage inventory, process orders and dispatch products with greater control and convenience.",
    ],
    bullets: [
      "Secure storage for products of different sizes and volumes",
      "Incoming products organised and stock movement recorded",
      "Orders picked, prepared and packed for safe dispatch",
      "Prepared orders moved from the warehouse into the delivery network",
      "Returned products received, managed and actioned systematically",
      "Support that adapts to changing stock levels and order volumes",
    ],
    bestFor: [
      "E-commerce sellers handling daily orders",
      "Retailers who want stock held away from the store",
      "Distributors managing inventory and replenishment",
      "Manufacturers who prefer not to store stock at the production site",
      "Businesses whose order volumes are growing",
    ],
    vehicles: [],
    sections: [
      {
        title: "Inventory handling and stock visibility",
        body: [
          "Managing stock accurately is essential for smooth business operations. The team helps organise incoming products, maintain stock movement records and keep inventory ready for order fulfilment.",
          "Better stock visibility shows what is available, what needs replenishment and what is moving faster — supporting better planning and more informed decisions.",
        ],
      },
      {
        title: "A flexible fulfilment partner for growth",
        body: [
          "As your business grows, your warehousing and order-processing needs can change quickly. Flexible support adapts to changing stock levels, order volumes and delivery requirements.",
          "By bringing storage, inventory handling, packing and dispatch together, the fulfilment journey stays smoother — giving you more time and confidence to focus on customers, products and growth.",
        ],
      },
    ],
    showLanes: false,
    questions: [
      {
        question: "What does fulfilment include?",
        answer:
          "Storage, inventory handling, order processing and packing, and dispatch into the delivery network — brought together so the fulfilment journey is smoother.",
      },
      {
        question: "How are returns handled?",
        answer:
          "Returned products are received, managed systematically and given the next appropriate action, which keeps the post-delivery process organised and your inventory under control.",
      },
      {
        question: "What if my order volumes change?",
        answer:
          "Support is flexible and can adapt to changing stock levels, order volumes and delivery requirements as your business grows.",
      },
    ],
    signature: {
      kind: "loop",
      title: "The fulfilment loop",
      lede: "From the shelf to the customer — and back, when a return comes in.",
      stages: [
        { title: "Storage", body: "Products are held in secure, organised storage." },
        { title: "Inventory", body: "Stock is recorded and kept ready for orders." },
        { title: "Pick & pack", body: "Orders are picked, prepared and packed for safe dispatch." },
        { title: "Dispatch", body: "Prepared orders move into the delivery network." },
      ],
      returnLabel: "Returns come back into stock",
      capabilitiesTitle: "What the warehouse does",
      capabilities: [
        {
          title: "Secure storage space",
          body: "Your inventory has a safe, organised place to be stored, so goods stay arranged, accessible and ready for fulfilment — and you carry less at your own office, store or production site.",
        },
        {
          title: "Inventory handling and stock visibility",
          body: "Incoming products are organised, stock movement is recorded and inventory is kept ready for orders.",
        },
        {
          title: "Order processing and packing",
          body: "Once an order is received, the required products are picked, prepared and packed with appropriate packaging.",
        },
        {
          title: "Dispatch and returns support",
          body: "Prepared orders enter the delivery network, and returned products are received and managed systematically.",
        },
      ],
    },
  },
];

/* ——— Index page (/services) ——— */
export const servicesIndex = {
  eyebrow: "Services",
  title: "What we move across India.",
  lede: "Four services, one desk. Whichever you book, the same team coordinates pickup, movement and delivery — the difference is the shape of the shipment: a parcel, a whole vehicle, a run across the city, or stock on a shelf.",
  /** Derived from the catalogue, so it cannot disagree with it. */
  countLine: (count: number, hubCount: number): string =>
    `${count} services · ${hubCount} hubs on the map`,
  fleetTitle: "Vehicles we put on a load",
  fleetNote:
    "The fleet grid is derived from the services above: a vehicle shows here because at least one service lists it. Tell us the load and the desk picks the vehicle, not the other way round.",
  askLine: "Not sure which of these your load is?",
  askLabel: "Ask the desk",
  backLabel: "All services",
  backHref: "/services",
} as const;

/* ——— Detail page (/services/[slug]) ——— */
export const serviceDetail = {
  /** Small-caps line above the H1; the page appends the catalogue position. */
  eyebrow: "Service",
  includedTitle: "What's included",
  detailTitle: "In detail",
  /** Small-caps label on the signature block above the numbered sections. */
  signatureEyebrow: "At a glance",
  bestForTitle: "What it fits",
  vehiclesTitle: "Vehicles on this service",
  lanesTitle: "Lanes from Surat",
  questionsTitle: "Questions",
  /** Line above the map. The hub count comes from `hubs.ts`, never here. */
  lanesLine: (hubCount: number, origin: string): string =>
    `${hubCount} hubs, dispatched from ${origin}.`,
  lanesNote:
    "Every one of them is a place this service can be booked to; a delivery outside the map is a question for the desk, not a promise on a page.",
  asideTitle: "Rates & pickup",
  asideNote:
    "Send the load, the lane and the date. The rate is confirmed before anything is booked.",
  ctaNote: "Phone and WhatsApp appear here once the desk's numbers are published.",
  callLabel: "Call",
  emailLabel: "Email",
  previousLabel: "Previous",
  nextLabel: "Next",
  /** Prefill for the aside's WhatsApp row — the service named in the message,
     so a reply arrives already about the right load. */
  whatsappMessage: (serviceName: string): string =>
    `Hello, I'd like a rate for ${serviceName} from Surat.`,
} as const;

export function findService(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}
