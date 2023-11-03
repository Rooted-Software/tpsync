import { db } from "@/lib/db"

// Helper Functions
function normalizePhone(phone) {
  if (phone && phone.length === 11 && phone[0] === "1") {
    phone = phone.slice(1)
  }
  // remove all non numeric characters
  phone = phone.replace(/\D/g, "")
  return phone
}

function properCase(str) {
  str = str || ""
  // Capitalizes the first letter in a text string and any other letters in text that follow any character other than a letter. Converts all other letters to lowercase letters.
  str = str.toLowerCase()
  str = str.replace(/(?:^|\s)\S/g, function (a) {
    return a.toUpperCase()
  })
  return str
}

function normalizeStreet(street) {
  street = street || ""
  street = street.trim()
  //  repleace Ave or Ave. at the end of street with Avenue
  street = street.replace(/Ave\.?$/, "Avenue")
  // replace St or St. at the end of street with Street
  street = street.replace(/St\.?$/, "Street")
  // replace Dr or Dr. at the end of street with Drive
  street = street.replace(/Dr\.?$/, "Drive")
  // replace Rd or Rd. at the end of street with Road
  street = street.replace(/Rd\.?$/, "Road")
  street = street.replace(/Ln\.?$/, "Lane")
  street = street.replace(/Blvd\.?$/, "Boulevard")
  street = street.replace(/Ct\.?$/, "Court")
  street = street?.toLowerCase()

  return street
}

function formatPhone(phone) {
  // format phone number like (123) 456-7890
  phone = phone || ""
  phone = phone.trim()
  // remove all non numeric characters
  phone = phone.replace(/\D/g, "")
  // add the parens and dashes
  phone = phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")
  return phone
}

function normalizeState(state) {
  state = state || ""
  state = state.trim()
  // convert 2 letter state to full state name
  if (state.length === 2) {
    state = state.toUpperCase()
    const stateMap = {
      AL: "Alabama",
      AK: "Alaska",
      AZ: "Arizona",
      AR: "Arkansas",
      CA: "California",
      CO: "Colorado",
      CT: "Connecticut",
      DE: "Delaware",
      DC: "District Of Columbia",
      FL: "Florida",
      GA: "Georgia",
      HI: "Hawaii",
      ID: "Idaho",
      IL: "Illinois",
      IN: "Indiana",
      IA: "Iowa",
      KS: "Kansas",
      KY: "Kentucky",
      LA: "Louisiana",
      ME: "Maine",
      MD: "Maryland",
      MA: "Massachusetts",
      MI: "Michigan",
      MN: "Minnesota",
      MS: "Mississippi",
      MO: "Missouri",
      MT: "Montana",
      NE: "Nebraska",
      NV: "Nevada",
      NH: "New Hampshire",
      NJ: "New Jersey",
      NM: "New Mexico",
      NY: "New York",
      NC: "North Carolina",
      ND: "North Dakota",
      OH: "Ohio",
      OK: "Oklahoma",
      OR: "Oregon",
      PA: "Pennsylvania",
      RI: "Rhode Island",
      SC: "South Carolina",
      SD: "South Dakota",
      TN: "Tennessee",
      TX: "Texas",
      UT: "Utah",
      VT: "Vermont",
      VA: "Virginia",
      WA: "Washington",
      WV: "West Virginia",
      WI: "Wisconsin",
      WY: "Wyoming",
    }
    state = stateMap[state]
  }

  return state
}

function normalizeAddress(address) {
  address.address1 = normalizeStreet(address.address1)
  address.address2 = normalizeStreet(address.address2)
  address.state = normalizeState(address.state)
  address.country = normalizeCountry[address.country] || address.country
  address.postal = normalizePostal(address.postal)
  return address
}

function normalizePostal(postal) {
  postal = postal || ""
  postal = postal.trim()
  // get just first five digits
  postal = postal.slice(0, 5)

  return postal
}

function addressMatcher(address1, address2) {
  address1 = normalizeAddress(address1)
  address2 = normalizeAddress(address2)

  return (
    // if the first five of address1.address1 and address2.address1 are the same
    // address1.address1 === address2.address1 &&
    // address1.address2 === address2.address2 &&
    // address1.city === address2.city &&
    // address1.state === address2.state &&
    // address1.country === address2.country &&
    address1.address1.slice(0, 5).toLowerCase() ===
      address2.address1.slice(0, 5).toLowerCase() &&
    address1.postal === address2.postal
  )
}

export function generateEventQuery(searchParams) {
  const allowOrderFields = ["createdAt", "matchQuality", "status"]
  const allowFilterFields = [
    "donationId",
    "webhookId",
    "status",
    "matchQuality",
    "fund",
    "origin",
    "segment",
    "virtuousContact",
    "event",
    "createdAt",
    "synced",
    "matchQuality",
    "createdAt",
  ]
  const jsonFilterFields = [
    "origin",
    "segment",
    "event",
    "virtuousContact",
    "donationId",
    "fund",
  ]

  console.log(searchParams)
  const page = parseInt(searchParams?.page || "0") || 0

  let orderField = searchParams?.orderField || "createdAt"
  const orderDirection = searchParams?.orderDirection || "desc"
  // see if ordery boy is in the allowOrderFields and if not, set it to createdAt
  if (!allowOrderFields.includes(orderField)) {
    orderField = "createdAt"
  }
  let orderBy: Record<string, string> = {}
  orderBy[orderField] = orderDirection

  // for each of the allowed fields, construct an object for the prisma where clause
  const filterObj = {}
  let jsonParamsCount = 0
  // count how many allowFilterFields are in the searchParams
  jsonFilterFields.forEach((key) => {
    if (searchParams[key]) {
      jsonParamsCount++
    }
  })

  let AND: any[] = []
  let OR: any[] = []

  const isMultiple = jsonParamsCount > 1

  for (const key of allowFilterFields) {
    let value = searchParams[key]
    if (value === "true") {
      value = true
    }
    if (value === "false") {
      value = false
    }
    if (
      value !== undefined &&
      value !== "" &&
      value !== "undefined" &&
      value !== "null"
    ) {
      if (key === "matchQuality" || key === "virtuousContact") {
        filterObj[key] = parseInt(value)
      } else if (key === "createdAt") {
        // set filterobj key to the prisma structure for saying on date
        // set beginning to beginning of day and end to end of day
        const beginningOfDay = new Date(value) // set to beginning of day
        beginningOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(value) // set to end of day
        endOfDay.setHours(23, 59, 59, 999)

        filterObj[key] = {
          gte: beginningOfDay,
          lte: endOfDay,
        }
      } else if (key === "fund") {
        if (isMultiple) {
          AND.push({
            payload: { path: "$.donation.fund.name", equals: value },
          })
        } else {
          filterObj["payload"] = {
            path: "$.donation.fund.name",
            equals: value,
          }
        }
      } else if (key === "donationId") {
        if (isMultiple) {
          AND.push({
            payload: { path: "$.donation.id", equals: value },
          })
        } else {
          filterObj["payload"] = {
            path: "$.donation.id",
            equals: value,
          }
        }
      } else if (key === "origin") {
        if (isMultiple) {
          AND.push({
            payload: { path: "$.origin", equals: value },
          })
        } else {
          filterObj["payload"] = {
            path: "$.origin",
            equals: value,
          }
        }
      } else if (key === "segment") {
        OR.push({
          payload: {
            path: "$.custom_field_responses.segment_name",
            equals: value,
          },
        })
        OR.push({
          payload: {
            path: "$.custom_field_responses.campaign_segmente",
            equals: value,
          },
        })
        OR.push({
          payload: {
            path: "$.custom_field_responses.campaign_segment_",
            equals: value,
          },
        })
        OR.push({
          payload: {
            path: "$.custom_field_responses.campaign_source",
            equals: value,
          },
        })
      } else {
        filterObj[key] = value
      }
    }
  }
  if (isMultiple) {
    filterObj["AND"] = AND
  }
  if (OR.length > 0) {
    filterObj["OR"] = OR
  }

  return { filterObj: filterObj, orderBy: orderBy, page: page }
}

async function getRecurringMatch(commitment_uid) {
  const recQuery = `{
    "groups": [
        {
            "conditions": [
                {
                    "parameter": "Commitment UID",
                    "operator": "Is",
                    "value": "${commitment_uid || ""}",
                }
            ]
        }
    ],
    "sortBy": "Create DateTime UTC",
    "descending": "true"
  }`

  const resRecurringGift = await fetch(
    "https://api.virtuoussoftware.com/api/RecurringGift/Query?skip=0&take=10",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VIRTUOUS_PRODUCTION_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: recQuery,
    }
  )
  console.log(recQuery)
  const recurringGiftData = await resRecurringGift.json()
  return recurringGiftData
}

async function getRecurringMatchFromOriginating(originating_uid) {
  const recQuery = `{
    "groups": [
        {
            "conditions": [
                {
                    "parameter": "originating_uid",
                    "operator": "Is",
                    "value": "${originating_uid || ""}",
                }
            ]
        }
    ],
    "sortBy": "Create DateTime UTC",
    "descending": "true"
  }`

  const resRecurringGift = await fetch(
    "https://api.virtuoussoftware.com/api/RecurringGift/Query?skip=0&take=10",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VIRTUOUS_PRODUCTION_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: recQuery,
    }
  )
  console.log(recQuery)
  const recurringGiftData = await resRecurringGift.json()
  return recurringGiftData
}

function generateMatchWarningArray(virContact, payloadContact) {
  const phoneMatch =
    virContact.phone == payloadContact.phone || payloadContact.phone === ""
  const emailMatch =
    virContact.email == payloadContact.email || payloadContact.email === ""
  let nameMatch =
    phoneMatch &&
    emailMatch &&
    virContact.contactType === "Household" &&
    virContact.firstName === (payloadContact.firstName || "") &&
    virContact.lastName === (payloadContact.lastName || "") // ignoring prefix and suffix for now && contact.contactIndividuals[0].prefix === (json.payload.title || '') && contact.contactIndividuals[0].suffix === (json.payload.suffix || '')
  let tempArray: any = []
  if (!nameMatch) {
    !phoneMatch
      ? tempArray.push("Phone Not Found on Contact: " + payloadContact.phone)
      : null
    !emailMatch
      ? tempArray.push("Email Not Found on Contact: " + payloadContact.email)
      : null
    virContact.contactType !== "Household"
      ? tempArray.push(
          "Contact Type:  " +
            virContact.type +
            " not equal to Household" +
            "<br/>"
        )
      : null
    virContact.firstName !== payloadContact.firstName
      ? tempArray.push(
          "First Name:  " +
            virContact.firstName +
            " not equal to " +
            payloadContact.firstName
        )
      : null
    virContact.lastName !== payloadContact.lastName
      ? tempArray.push(
          "Last Name:  " +
            virContact.lastName +
            " not equal to " +
            payloadContact.lastName
        )
      : null
    virContact.title !== (payloadContact.title || "")
      ? tempArray.push(
          "Title:  " +
            virContact.prefix +
            " not equal to " +
            payloadContact.title
        )
      : null
    virContact.suffix !== (payloadContact.suffix || "")
      ? tempArray.push(
          "Suffix:  " +
            virContact.suffix +
            " not equal to " +
            payloadContact.suffix
        )
      : null
  }

  virContact.address1 !== payloadContact.address1
    ? tempArray.push(
        "Address 1:  " +
          virContact.address1 +
          " not equal to " +
          payloadContact.address1
      )
    : null
  virContact.address2 !== payloadContact.address2
    ? tempArray.push(
        "Address 2:  " +
          virContact.address2 +
          " not equal to " +
          payloadContact.address2
      )
    : null
  virContact.city !== payloadContact.city
    ? tempArray.push(
        "City:  " + virContact.city + " not equal to " + payloadContact.city
      )
    : null
  virContact.state !== payloadContact.state
    ? tempArray.push(
        "State:  " + virContact.state + " not equal to " + payloadContact.state
      )
    : null
  virContact.country !== normalizeCountry[payloadContact.country]
    ? tempArray.push(
        "Country:  " +
          virContact.country +
          " not equal to " +
          normalizeCountry[payloadContact.country]
      )
    : null
  virContact.postal !== payloadContact.postal
    ? tempArray.push(
        "Postal:  " +
          virContact.postal +
          " not equal to " +
          payloadContact.postal
      )
    : null

  return tempArray
}

export const blockedEmails = [
  "Null@anedot.com",
  "Join@tpusa.com,",
  "xxxx@tpusa.com",
  "xxx@tpusa.com",
  "null@anedot.com",
  "join@tpusa.com",
  "xxxxx@tpusa.com",
  "",
  "marshal@rooted.software",
  "nomail@tpusa.com",
]
// we may be able to clear *@tpusa.net
export const blockedPhoneNumbers = [
  "5555555555",
  "15555555555",
  "5034200536",
  "15034200536",
]

export const anedotGiftTypeToVirtuous = {
  cash: "Cash",
  check: "Check",
  credit_card: "Credit",
  bank_account: "EFT",
  crypto: "Cryptocoin",
  non_cash: "Non-Cash",
  other: "Other",
  distribution: "Qualified Charitable Distribution",
  reversing: "Reversing Transaction",
  stock: "Stock",
}

export function getGiftType(string) {
  return anedotGiftTypeToVirtuous[string] || "Other"
}

export const anedotCardTypeToVirtuous = {
  visa: "Visa",
  master: "Mastercard",
  american_express: "American Express",
  discover: "Discover",
  jcb: "JCB",
  diners: "Diners Club",
  unionpay: "UnionPay",
  other: "Other",
}

const en = { "click here to unsubscribe": "click here to unsubscribe" }
const fr = { "click here to unsubscribe": "cliquez ici pour vous désabonner" }

const i18n = fr

i18n["click here to unsubscribe"]

export const normalizeCountry = {
  US: "United States",
  USA: "United States",
  "United States": "United States",
}

export const anedotFrequencyTypeToVirtuous = {
  once: "",
  Once: "",
  bimonthly: "Bimontly",
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  semiannually: "Semiannually",
  yearly: "Annually",
  biennially: "Biennially",
}

export const anedotAccountToName = {
  a1c701b4dd7ebaefcd38b: "Faith",
  a6dc72c49b5e3629cd82a: "Blexit",
  a65655106ea9c404245e7: "TPUSA",
}

export function getCardType(string) {
  return anedotCardTypeToVirtuous[string] || "Other"
}

export function getAnedotFrequencyTypeToVirtuous(string) {
  return anedotFrequencyTypeToVirtuous[string] || "Other"
}

// Local DB
export const getAnedotEvents = async (team, skip, take, where, orderBy) => {
  return await db.anedotEvent.findMany({
    where,
    select: {
      id: true,
      webhookId: true,
      integrationId: true,
      event: true,
      payload: true,
      createdAt: true,
      updatedAt: true,
      src: true,
      env: true,
      status: true,
      synced: true,
      matchQuality: true,
      attention: true,
      attentionReason: true,
      projectMatch: true,
      segmentMatch: true,
      addressMatch: true,
      recurringGiftMatch: true,
      updateRecurring: true,
      recurringGiftId: true,
      virtuousContact: true,
      virtuousProject: true,
      virtuousSegment: true,
      contactMatch: true,
      virtuousQuery: true,
    },
    orderBy,
    skip: skip,
    take: take,
  })
}

export const getAnedotEventsCount = async (team, where, orderBy) => {
  return await db.anedotEvent.count({
    where,
    orderBy,
  })
}

export const updateAnedotEvent = async (id, synced, status, meta, query) => {
  console.log("in update anedot event")
  const event = await db.anedotEvent.update({
    where: {
      id: id,
    },
    data: {
      recurringGiftId: meta.recurringGiftId,
      recurringGiftMatch: meta.recurringGiftMatch,
      updateRecurring: meta.updateRecurring,
      synced: synced,
      status: status,
      projectMatch: meta.projectMatch,
      contactMatch: meta.nameMatch,
      segmentMatch: meta.segmentMatch,
      addressMatch: meta.addressMatch,
      matchQuality: meta.matchQuality,
      virtuousContact: meta.contactId,
      virtuousProject: meta.projectId,
      virtuousSegment: meta.segmentId,
      attention:
        meta.matchQuality < 4 ||
        !meta.projectMatch ||
        !meta.segmentMatch ||
        !meta.nameMatch
          ? true
          : false,

      attentionReason: meta.attentionString,
      virtuousQuery: query,
      syncErrorResponse: meta?.syncErrorResponse,
      syncSrc: meta?.syncSrc,
    },
  })
  console.log("event updated")
  return event
}

// Virtuous API
export const getVirtuousProjectByFundName = async (fundName) => {
  // check segment and project match for one time gifts
  // does such a project exist  (TODO: we may want to do this by identifier and code instead of name)
  const projectQuery = `{
      "groups": [
          {
              "conditions": [
                  {
                      "parameter": "Project Name",
                      "operator": "Is",
                      "value": "${fundName}",
                  }
              ]
          }
      ],
      "sortBy": "Create Date",
      "descending": "True"
  }`
  const resProject = await fetch(
    "https://api.virtuoussoftware.com/api/Project/Query?skip=0&take=10",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VIRTUOUS_PRODUCTION_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: projectQuery,
    }
  )
  const projectData = await resProject.json()
  // console.log('project: ', projectData)
  const projectMatch = projectData?.list?.length > 0
  if (projectMatch) {
    return projectData.list[0].id
  } else {
    console.log("error project payload:", projectQuery)
    return 0
  }
}

export const getVirtuousSegmentByName = async (segmentName) => {
  // does such a segment exist
  const segmentQuery = `{
    "search": "${segmentName}",
  }`
  const resSegment = await fetch(
    "https://api.virtuoussoftware.com/api/Segment/Search",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VIRTUOUS_PRODUCTION_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: segmentQuery,
    }
  )
  const segmentData = await resSegment.json()
  console.log("segment: ", segmentData)
  const segmentMatch = segmentData?.list && segmentData?.list?.length > 0
  if (segmentMatch) {
    return segmentData.list[0].id
  }
  return 0
}

export const getVirtuousContactBySearch = async (payloadContact) => {
  // check contact match for one time gifts
  console.log("in get virtuous contact by search")
  const contactQuery = `{
    "groups": [
        ${
          payloadContact.email !== ""
            ? `{
            "conditions": [
                {
                    "parameter": "Email Address",
                    "operator": "Is",
                    "value": "${payloadContact.email}",
                },
            ]
        },`
            : null
        }
        {
            "conditions": [
                {
                    "parameter": "Contact Name",
                    "operator": "StartsWith",
                    "value": "${payloadContact.firstName}",
                },
                {
                    "parameter": "Contact Name",
                    "operator": "EndsWith",
                    "value": "${payloadContact.lastName}"
                }
            ]
        },
        ${
          payloadContact.phone !== ""
            ? `{
            "conditions": [
                {
                    "parameter": "Phone Number",
                    "operator": "Is",
                    "value": "${payloadContact.phone}",
                }
            ]
        },`
            : null
        }
        {
          "conditions": [
              {
                  "parameter": "Postal",
                  "operator": "StartsWith",
                  "value": "${normalizePostal(payloadContact.postal)}",
              }
          ]
      }
    ],
    "sortBy": "Create Date",
    "descending": "True"
    }`
  // search for the contact
  const resSearchContact = await fetch(
    "https://api.virtuoussoftware.com/api/Contact/Query",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VIRTUOUS_PRODUCTION_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: contactQuery,
    }
  )
  console.log("contact query --- : ", contactQuery)
  var contactSearchData = await resSearchContact.json()
  console.log("contact ------: ", contactSearchData)

  ///contact search ranking if Virtuous returns more than 1
  if (contactSearchData?.list?.length > 1) {
    // for each contact assign a match score based on if its values contain the related json payload values
    // 1 point for each match
    console.log("score search results")
    var tempContact = { matchScore: 0 }
    contactSearchData?.list.forEach((contact) => {
      contact.matchScore = 0
      console.log(contact)
      contact.phone = normalizePhone(contact.phone)
      contact.email.indexOf(payloadContact.email) > -1
        ? contact.matchScore++
        : null
      contact.name.indexOf(payloadContact.firstName) > -1
        ? contact.matchScore++
        : null
      contact.name.indexOf(" " + payloadContact.lastName) > -1
        ? contact.matchScore++
        : null // the space is normal in front of the last name, and will help elleviate false positives
      contact.phone.indexOf(payloadContact.phone) > -1
        ? contact.matchScore++
        : null
      contact.address.indexOf(normalizePostal(payloadContact.postal)) > -1
        ? contact.matchScore++
        : null
      if (contact.matchScore > tempContact.matchScore) {
        tempContact = contact
      }
    })
    console.log("tempContact: ", tempContact)
    // sort the contacts by match score
    contactSearchData.list.sort((a, b) =>
      a.matchScore < b.matchScore ? 1 : -1
    )
    console.log(contactSearchData.list)
    // use the highest match score
    // contact = contactSearchData.list[0]
    // if that just worked, we already have our best one at the begining of the list, which makes the rest of things work, lol
  }

  if (contactSearchData?.list?.length > 0) {
    // if we don't have a high enough match score, return null
    if (contactSearchData.list[0].matchScore < 3) {
      return null
    }

    // get the contact so our details are normalized wether or not we had an id from recurring or not
    const resContact = await fetch(
      "https://api.virtuoussoftware.com/api/Contact/" +
        contactSearchData.list[0].id,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.VIRTUOUS_PRODUCTION_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    )
    const contactData = await resContact.json()
    console.log("contact --final contact---: ", contactData)
    return contactData
  }
  console.log(" ________________ no contact found ________________")
  return null
}

function getNormalizedContactFromVirtuousContact(
  virtuousContact,
  payloadContact
) {
  // we have to do this because there can be many individuals on a virtuous contact.  We need to search through the individuals to see who matches the payload
  let highestRankedIndividual = 0
  if (!virtuousContact) {
    return null
  }
  virtuousContact?.contactIndividuals?.forEach((individual, index) => {
    individual.matchScore = 0
    individual.prefix === payloadContact.title ? individual.matchScore++ : null
    individual.firstName === payloadContact.firstName
      ? individual.matchScore++
      : null
    individual.lastName === payloadContact.lastName
      ? individual.matchScore++
      : null
    individual.suffix === payloadContact.suffix ? individual.matchScore++ : null

    const phoneMatch =
      individual.contactMethods.filter((method) => {
        // handle method values that have a 1 prefix...
        let tempValue = normalizePhone(method.value)
        return tempValue === payloadContact.phone
      }).length > 0 || payloadContact.phone === ""
    if (phoneMatch) {
      individual.matchScore++
    }
    const emailMatch =
      individual.contactMethods.filter(
        (method) => method.value === payloadContact.email
      ).length > 0 || payloadContact.email === ""
    if (emailMatch) {
      individual.matchScore++
    }

    if (individual.matchScore > highestRankedIndividual) {
      highestRankedIndividual = index
    }
  })
  if (!virtuousContact.contactIndividuals) {
    return null
  }
  // we have to turn contact nulls and undefined into blank strings for the match to work
  virtuousContact.contactIndividuals[highestRankedIndividual].prefix === null
    ? (virtuousContact.contactIndividuals[0].prefix = "")
    : null
  virtuousContact.contactIndividuals[highestRankedIndividual].suffix === null
    ? (virtuousContact.contactIndividuals[0].suffix = "")
    : null

  const dataHygieneCF = virtuousContact.customFields.find(
    (cf) => cf.name === "Data Hygiene Date (Contact)"
  )
  const dataHygieneDate =
    dataHygieneCF && dataHygieneCF.value ? dataHygieneCF.value : null

  const virContact = {
    contactType: virtuousContact.contactType,
    title:
      virtuousContact.contactIndividuals[highestRankedIndividual].prefix || "",
    firstName:
      virtuousContact.contactIndividuals[highestRankedIndividual].firstName ||
      "",
    middleName:
      virtuousContact.contactIndividuals[highestRankedIndividual].middleName ||
      "",
    lastName:
      virtuousContact.contactIndividuals[highestRankedIndividual].lastName ||
      "",
    suffix:
      virtuousContact.contactIndividuals[highestRankedIndividual].suffix || "",
    phone: normalizePhone(
      virtuousContact.contactIndividuals[
        highestRankedIndividual
      ].contactMethods.find((method) => {
        // handle method values that have a 1 prefix...
        let tempValue = normalizePhone(method.value)
        return tempValue === payloadContact.phone
      })?.value || ""
    ),
    email:
      virtuousContact.contactIndividuals[
        highestRankedIndividual
      ].contactMethods?.find((method) => method.value === payloadContact.email)
        ?.value || "",
    address1: virtuousContact.address?.address1 || "",
    address2: virtuousContact.address?.address2 || "",
    city: virtuousContact.address?.city || "",
    state: virtuousContact.address?.state || "",
    postal: virtuousContact.address?.postal || "",
    country: virtuousContact.address?.country || "",
    dataHygieneDate: dataHygieneDate || "",
  }

  return virContact
}

export const getAnedotGiftToVirtuousQuery = async (json, reQuery) => {
  console.log("in get anedot gift to virtuous query")
  // set date constants

  const today = new Date()
  const shortDate =
    today.getMonth() + 1 + "." + today.getDate() + "." + today.getFullYear()
  const giftDate = new Date(json.payload.date)
  const giftShortDate =
    giftDate.getMonth() +
    1 +
    "." +
    giftDate.getDate() +
    "." +
    giftDate.getFullYear()

  // set variables for tracking quality
  let recurringGiftId = json.recurringGiftId || ""
  let recurringGiftMatch = false
  let projectMatch = false
  let segmentMatch = false
  let nameMatch = false
  let addressMatch = false
  let updateRecurring = false
  let attentionString = ""
  let attentionArray: any = []
  let projectId = json.projectId || 0
  let segmentId = json.segmentId || 0
  let contactId = json.virtuousContactId || 0
  let contact: any = {}
  let recurringGiftData: any = {}

  // purge contact email phone number
  blockedEmails.indexOf(json.payload.email) === -1
    ? (json.payload.email = json.payload.email)
    : (json.payload.email = "")
  // purge email ending in tpusa.org
  json.payload.email.indexOf("tpusa.org") > -1
    ? (json.payload.email = "")
    : (json.payload.email = json.payload.email)

  blockedPhoneNumbers.indexOf(json.payload.phone) === -1
    ? (json.payload.phone = json.payload.phone)
    : (json.payload.phone = "")

  json.payload.suffix === null ? (json.payload.suffix = "") : null
  json.payload.title === null ? (json.payload.title = "") : null

  // Set Address For easier comparison
  const payloadContact = {
    title: json.payload.title || "",
    firstName: json.payload.first_name || "",
    middleName: json.payload.middle_name || "",
    lastName: json.payload.last_name || "",
    suffix: json.payload.suffix || "",
    phone: normalizePhone(json.payload.phone) || "",
    email: json.payload.email || "",
    address1:
      json.payload.address_line_1 ||
      json.payload.street ||
      json.payload.address?.street ||
      "",
    address2:
      json.payload.address_line_2 ||
      json.payload.street_2 ||
      json.payload.address?.street_2 ||
      "",
    city:
      json.payload?.city ||
      json.payload?.address?.city ||
      json.payload?.address_city ||
      "",
    state:
      json.payload?.address_region ||
      json.payload?.address?.state ||
      json.payload?.state ||
      json.payload?.address_state ||
      "",
    postal:
      json.payload?.address_postal_code ||
      json.payload?.zip ||
      json.payload?.address_zip ||
      "",
    country:
      normalizeCountry[
        json.payload.address_country ||
          json.payload.country ||
          json.payload.address?.country
      ] ||
      json.payload.address_country ||
      "",
  }
  console.log("initial mod payload contact: ")
  console.log(payloadContact)
  //set segment for easier comparison
  const payloadSegment =
    json.payload?.custom_field_responses?.segment_name ||
    json.payload?.custom_field_responses?.campaign_segment ||
    json.payload?.custom_field_responses?.campaign_segment_ ||
    json.payload?.custom_field_responses?.campaign_source ||
    ""
  console.log("payload segment: " + payloadSegment)
  // determine if the payload is recurring or not....if so, then we need to create or update a recurring gift record: {Origin}		Create Recurring Gift		TRUE	Hosted = false, recurring = true
  const payloadRecurring = json.payload.origin === "recurring"

  if (payloadRecurring) {
    console.log("recurring gift")
    if (json.payload?.commitment_uid) {
      console.log("commitment uid")
      // can we get the recurring gift from the originating_uid
      recurringGiftData = await getRecurringMatch(json.payload.commitment_uid)
    } else if (json.payload?.originating_uid) {
      console.log("originating uid")
      // can we get the recurring gift from the originating_uid
      recurringGiftData = await getRecurringMatchFromOriginating(
        json.payload.originating_uid
      )
    }

    // this is a recurring gift...we need to update the recurring gift count (if virtuous will let us) But at lease we can get some data from the matched recurring gift
    if (recurringGiftData?.list?.length > 0) {
      recurringGiftMatch = true
      recurringGiftId = recurringGiftData.list[0].id
      contactId = recurringGiftData.list[0].contactId || 0
      if (contactId > 0) {
        const resContact = await fetch(
          "https://api.virtuoussoftware.com/api/Contact/" +
            recurringGiftData.list[0].contactId,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${process.env.VIRTUOUS_PRODUCTION_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        )
        const contactData = await resContact.json()
        contact = contactData
      }

      const anedotGiftCountCF = recurringGiftData.list[0].customFields.find(
        (cf) => cf.name === "Anedot Recurring Count"
      )
      const anedotGiftCount = anedotGiftCountCF
        ? parseInt(anedotGiftCountCF.value)
        : 0
      if (
        json.payload.commitment_index &&
        anedotGiftCount &&
        anedotGiftCount < parseInt(json.payload.commitment_index)
      ) {
        updateRecurring = true
      }
      projectMatch =
        recurringGiftData.list[0].designations[0].projectCode ===
        json.payload?.donation?.fund.name
      if (projectMatch) {
        projectId = recurringGiftData.list[0].designations[0].projectId
      }
      segmentMatch = recurringGiftData.list[0].segment === payloadSegment.trim()
      if (segmentMatch) {
        segmentId = recurringGiftData.list[0].segmentId
      }
    } else {
      recurringGiftId = json.payload.commitment_uid
    }
  }
  // determine project and segment
  if (!projectId && json.payload?.donation?.fund?.name) {
    projectId =
      (await getVirtuousProjectByFundName(json.payload?.donation?.fund.name)) ||
      0
    if (projectId > 0) {
      projectMatch = true
    }
  }
  if (!segmentId) {
    segmentId = (await getVirtuousSegmentByName(payloadSegment)) || 0
    if (segmentId > 0) {
      segmentMatch = true
    }
  }

  // can we also match the contact? if we have a contact ID from the recurring, use that, otherwise try to get the contact with alternative methods.
  if (contactId < 1) {
    console.log("no contact id from recurring gift")
    contact = await getVirtuousContactBySearch(payloadContact)
  }

  console.log("we should have a contact")
  console.log(contact)
  const virContact = getNormalizedContactFromVirtuousContact(
    contact,
    payloadContact
  )
  // calculate contact match
  if (contact?.id && virContact) {
    contactId = contact.id
    console.log("virtuous contact: ", contact)
    console.log("payloadContact: ", payloadContact)

    console.log("virtuous normalized contact: ")
    console.log(virContact)
    const phoneMatch =
      virContact.phone == payloadContact.phone || payloadContact.phone === ""
    const emailMatch =
      virContact.email == payloadContact.email || payloadContact.email === ""
    nameMatch =
      phoneMatch &&
      emailMatch &&
      contact.contactType === "Household" &&
      virContact.firstName === (payloadContact.firstName || "") &&
      virContact.lastName === (payloadContact.lastName || "") // ignoring prefix and suffix for now && contact.contactIndividuals[0].prefix === (json.payload.title || '') && contact.contactIndividuals[0].suffix === (json.payload.suffix || '')
    addressMatch = addressMatcher(virContact, payloadContact)
    attentionArray = generateMatchWarningArray(virContact, payloadContact)
  }

  //  calculate match quality
  const matchQuality =
    (projectMatch ? 1 : 0) +
    (segmentMatch ? 1 : 0) +
    (nameMatch ? 1 : 0) +
    (addressMatch ? 1 : 0)
  console.log("match quality: " + matchQuality)
  console.log("attention: " + JSON.stringify(attentionArray))

  // if we found a recurring gift with that commitment ID....lets update the count.

  // should we actually do this as json so we can do some things like unsetting if we don't need to send recurring data
  // also, we need to format the data into our new standards for virtuous (address and phone, probably prior to the query)
  // we want to only send new contact data if we don't have a contact id OR if the data hygine date is older than 45 days and

  let contactString = `contact: {
            ${contact && contact.id ? 'id: "' + contact.id + '",' : ""}
            type: "Household",
            title: "${json.payload.title}",
            firstname: "${properCase(json.payload.first_name)}",
            middlename: "${properCase(json.payload.middle_name)}",
            lastname: "${properCase(json.payload.last_name)}",
            suffix: "${json.payload.suffix}",
            ${
              json.payload.email &&
              blockedEmails.indexOf(json.payload.email) === -1
                ? `email: "${json.payload.email}",`
                : ""
            }
            phone: "${formatPhone(payloadContact.phone)}",
            address: {
                address1: "${properCase(payloadContact.address1)}",
                address2: "${properCase(payloadContact.address2)}",
                city: "${properCase(payloadContact.city)}",
                state: "${payloadContact.state}",
                postal: "${payloadContact.postal}",
                country: "${payloadContact.country}"
            }, },`
  // if contact.datahyginedate < 45 days ago

  if (
    contact &&
    contact.id &&
    virContact &&
    virContact?.dataHygieneDate &&
    new Date(virContact.dataHygieneDate) >
      new Date(today.setDate(today.getDate() - 45)) &&
    addressMatch
  ) {
    contactString = `contact: {id: "${contact.id}" },`
  }

  const query = `
      {
        transactionSource: "Anedot${
          anedotAccountToName[json.payload.account_uid]
            ? " - " + anedotAccountToName[json.payload.account_uid]
            : ""
        } ${giftShortDate} ${json.payload?.campaign_uid ? ` - Campaign` : ""}${
    matchQuality < 4 ? " - Attention" : ""
  }",
        transactionId: "${json.payload.donation?.id || json.payload?.uid}-test",
        ${
          /* this seems to always want to create a recurring, not update it updateRecurring ? 'recurringGiftTransactionUpdate : "TRUE",' : ''*/ ""
        }
        ${
          recurringGiftId !== "" && !recurringGiftMatch
            ? 'recurringGiftTransactionId: "' + recurringGiftId + '",'
            : ""
        }
        ${contactString}
       
        ${
          recurringGiftId !== "" && !updateRecurring
            ? 'frequency: "' +
              getAnedotFrequencyTypeToVirtuous(json.payload.frequency) +
              '",'
            : ""
        }
        giftDate: "${giftShortDate}",
        giftType: "${getGiftType(json.payload.source)}",
        CreditCardType: "${getCardType(json.payload?.donation?.card_type)}",
        amount: "${json.payload.amount_in_dollars}",
        batch: "Anedot ${giftShortDate}${
    matchQuality < 4 ? "- Attention" : ""
  }",
        segment: "${payloadSegment}", 
        recurringGiftSegment:  "${payloadSegment}", 
        designations: [
          {
              name: "${json.payload?.donation?.fund.name}",
              amountDesignated: "${json.payload.amount_in_dollars}"
          }
        ],
        
        tribute: "${
          json.payload.in_honor_of
            ? "In honor of " + json.payload.in_honor_of
            : ""
        }" ,
        
      customFields: 
      {
          "T Shirt Size": "${
            json.payload?.custom_field_responses?.tee_shirt_size || ""
          }",
          "External Unique ID": "${json.payload.donation?.id || ""}",
          "Acknowledgment Type" : "General Form",
          "Funding Source": "Individual",
          "Check Deposited in Phoenix": "False",
          "Anedot Recurring Count" : "${json.payload.commitment_index || ""}",
          "Legacy Recurring ID": "${json.payload.commitment_uid || ""}",  
          "Promotional Item": "${
            json.payload.custom_field_responses?.promotion_item || ""
          }",
          "Anedot Action Page": "${json.payload.action_page_name || ""}",
          "Commitment UID": "${json.payload.commitment_uid || ""}",
          "Anedot Action Page Name": "${json.payload.action_page_name || ""}",
          "Donor Comments" : "${json.payload?.comments || ""}",
          "originating_uid": "${json.payload?.originating_uid || ""}",
          "campaign_uid": "${json.payload?.campaign_uid || ""}",
      },

    }
      `

  //return meta for logging
  const meta = {
    recurringGiftId: recurringGiftId,
    recurringGiftMatch: recurringGiftMatch,
    projectMatch: projectMatch,
    segmentMatch: segmentMatch,
    nameMatch: nameMatch,
    addressMatch: addressMatch,
    updateRecurring: updateRecurring,
    attentionString: JSON.stringify(attentionArray),
    projectId: projectId,
    segmentId: segmentId,
    contactId: contactId,
    matchQuality: matchQuality,
    syncErrorResponse: "",
    syncSrc: "",
  }
  console.log(query)
  console.log(meta)
  return { query, meta }
}
