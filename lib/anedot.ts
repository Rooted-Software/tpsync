import { db } from '@/lib/db'
import { virApiFetch } from './virApiFetch'

// Helper Functions

async function getRecurringMatch(commitment_uid) {
  const recQuery = `{
    "groups": [
        {
            "conditions": [
                {
                    "parameter": "Commitment UID",
                    "operator": "Is",
                    "value": "${commitment_uid || ''}",
                }
            ]
        }
    ],
    "sortBy": "Create DateTime UTC",
    "descending": "true"
  }`

  const resRecurringGift = await fetch('https://api.virtuoussoftware.com/api/RecurringGift/Query?skip=0&take=10', {
    method: 'POST',
    headers: {
        Authorization: `Bearer ${process.env.VIRTUOUS_API_KEY}`,
        'Content-Type': 'application/json',
    },
    body: recQuery,

  })
  console.log(recQuery)
  const recurringGiftData = await resRecurringGift.json()
  return recurringGiftData
}


export const blockedEmails = ['Null@anedot.com', 'Join@tpusa.com,', 'xxxx@tpusa.com','xxx@tpusa.com', 'null@anedot.com', 'join@tpusa.com', 'xxxxx@tpusa.com', '', 'marshal@rooted.software', 'nomail@tpusa.com']
// we may be able to clear *@tpusa.net 

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
  stock: "Stock"
}

export function getGiftType(string)  { 
  return  anedotGiftTypeToVirtuous[string] || "Other"
}

export const anedotCardTypeToVirtuous = { 
  visa: "Visa",
  master: "Mastercard",
  american_express: "American Express",
  discover: "Discover",
  jcb: "JCB",
  diners: "Diners Club",
  unionpay: "UnionPay",
  other: "Other"

}

export const anedotCountryNormalization = {
  US: "United States",
}

export const anedotFrequencyTypeToVirtuous = { 
  once: "",
  Once: "",
  bimonthly: "Bimontly",
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly : "Quarterly",
  semiannually: "Semiannually",
  yearly: "Annually",
  biennially: "Biennially"
}

export const anedotAccountToName = { 
  a1c701b4dd7ebaefcd38b: "Faith",
  a6dc72c49b5e3629cd82a: "Blexit",
  a65655106ea9c404245e7: "TPUSA",
}

export function getCardType(string)  { 
  return  anedotCardTypeToVirtuous[string] || "Other"
}

export function getAnedotFrequencyTypeToVirtuous(string)  { 
  return  anedotFrequencyTypeToVirtuous[string] || "Other"
}

// Local DB
export const getAnedotEvents = async (team, skip, take) => {
    return await db.anedotEvent.findMany({
      select: {
        id: true,
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


      },
      orderBy: {
        createdAt: 'asc',
      },
      skip: skip,
      take: take,
    })
  }

export const updateAnedotEvent = async (id, synced, status, meta, query ) => {
  console.log('in update anedot event')

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
      contactMatch:  meta.contactMatch,
      segmentMatch: meta.segmentMatch,
      addressMatch: meta.addressMatch,
      matchQuality: meta.matchQuality,
      virtuousContact: meta.virtuousContact,
      virtuousProject: meta.virtuousProject,
      virtuousSegment: meta.virtuousSegment,
      attention: meta.matchQuality < 4 ? true : false,
      attentionReason: meta.attentionString,
    },
  })
  console.log('event updated')
  console.log(event)
  return event
}



// Virtuous API
export const getAnedotGiftToVirtuousQuery = async (json) => {
  const today =  new Date()
const shortDate = (today.getMonth()+1)+'.'+today.getDate()+'.'+today.getFullYear();
const giftDate = new Date(json.payload.date)
const giftShortDate = (giftDate.getMonth()+1)+'.'+giftDate.getDate()+'.'+giftDate.getFullYear();

// set variables for tracking quality
let recurringGiftId = '';
let recurringGiftMatch = false; 
let projectMatch = false;
let segmentMatch = false;
let nameMatch = false; 
let addressMatch = false; 
let updateRecurring = false; 
let attentionString = ''
let projectId = 0; 
let segmentId = 0; 
let contactId = 0; 

// determine if the payload is recurring or not....if so, then we need to create or update a recurring gift record: {Origin}		Create Recurring Gift		TRUE	Hosted = false, recurring = true
const payloadRecurring = json.payload.origin === 'recurring'
let recurringGiftData: any = {}

if (payloadRecurring) {
  console.log('recurring gift')
  recurringGiftData = await getRecurringMatch(json.payload.commitment_uid) 
  // this is a recurring gift...we need to update the recurring gift count a
    if (recurringGiftData?.list?.length > 0) {
      recurringGiftMatch = true;
      recurringGiftId = recurringGiftData.list[0].id
      const anedotGiftCountCF = recurringGiftData.list[0].customFields.find(cf=> cf.name === "Anedot Recurring Count")
      console.log('anecdote gift count: ' + anedotGiftCountCF)
      const anedotGiftCount = anedotGiftCountCF ? parseInt( anedotGiftCountCF.value) : 0
      console.log('anecdote gift count: ' + anedotGiftCount)
      if (json.payload.commitment_index && anedotGiftCount && (anedotGiftCount < parseInt(json.payload.commitment_index))) {
        updateRecurring = true;
        console.log('prev anedot count: ' + anedotGiftCount )
        console.log('new anedot count: ' + json.payload.commitment_index )
      }
      console.log(recurringGiftData.list[0])
      console.log(recurringGiftData.list[0].designations[0].project + " : " +json.payload?.donation?.fund.name)
      console.log('project matched: ' + (recurringGiftData.list[0].designations[0].projectCode === json.payload?.donation?.fund.name))
      console.log(recurringGiftData.list[0].segment + " : " +json.payload?.custom_field_responses?.segment_name || json.payload?.custom_field_responses?.campaign_segment || json.payload?.custom_field_responses?.campaign_segment_  || json.payload?.custom_field_responses?.campaign_source || '')
      console.log('segment matched: ' + (recurringGiftData.list[0].segment === (json.payload?.custom_field_responses?.segment_name || json.payload?.custom_field_responses?.campaign_segment || json.payload?.custom_field_responses?.campaign_segment_  || json.payload?.custom_field_responses?.campaign_source || '').trim() ))
      projectMatch = recurringGiftData.list[0].designations[0].projectCode === json.payload?.donation?.fund.name
      if (projectMatch) { 
        projectId = recurringGiftData.list[0].designations[0].projectId
      }
      segmentMatch = recurringGiftData.list[0].segment === (json.payload?.custom_field_responses?.segment_name || json.payload?.custom_field_responses?.campaign_segment || json.payload?.custom_field_responses?.campaign_segment_  || json.payload?.custom_field_responses?.campaign_source || '').trim() 
      if (segmentMatch) { 
        segmentId = recurringGiftData.list[0].segmentId
      }
    } else {
      recurringGiftId = json.payload.commitment_uid
    }
}

if (!projectId) { 
  // check segment and project match for one time gifts
  // does such a project exist  (TODO: we may want to do this by identifier and code instead of name)
  const projectQuery = `{
    "groups": [
        {
            "conditions": [
                {
                    "parameter": "Project Name",
                    "operator": "Is",
                    "value": "${json.payload?.donation?.fund.name}",
                }
            ]
        }
    ],
    "sortBy": "Create Date",
    "descending": "True"
}`
  const resProject = await fetch('https://api.virtuoussoftware.com/api/Project/Query?skip=0&take=10', {
  method: 'POST',
    headers: {
        Authorization: `Bearer ${process.env.VIRTUOUS_API_KEY}`,
        'Content-Type': 'application/json',
    },
    body: projectQuery
  })
  const projectData = await resProject.json();
  console.log('project: ', projectData)
  projectMatch = projectData?.list?.length > 0;
  if (projectMatch) { 
    projectId = projectData.list[0].id
  } else { 
    console.log('error project payload:', projectQuery)
  }
} 
if (!segmentId) {
  // does such a segment exist
  const segmentQuery = `{
    "search": "${json.payload?.custom_field_responses?.segment_name || json.payload?.custom_field_responses?.campaign_segment || json.payload?.custom_field_responses?.campaign_segment_  || json.payload?.custom_field_responses?.campaign_source || '' }",
  }`
  const resSegment = await fetch('https://api.virtuoussoftware.com/api/Segment/Search', {
  method: 'POST',
    headers: {
        Authorization: `Bearer ${process.env.VIRTUOUS_API_KEY}`,
        'Content-Type': 'application/json',
    },
    body: segmentQuery
  })
  const segmentData = await resSegment.json();
  console.log('segment: ', segmentData)
  segmentMatch = segmentData?.list && segmentData?.list?.length > 0;
  if (segmentMatch) { 
    segmentId = segmentData.list[0].id
  }

}



// can we also match the contact? if we have a contact ID from the recurring, use that, otherwise try to get the contact with alternative methods.
let contact: any = {} ; 
if (recurringGiftData?.list?.length > 0 && recurringGiftData.list[0].contactId) {
const resContact = await fetch('https://api.virtuoussoftware.com/api/Contact/' + recurringGiftData.list[0].contactId, {
  method: 'GET',
  headers: {
      Authorization: `Bearer ${process.env.VIRTUOUS_API_KEY}`,
      'Content-Type': 'application/json',
  },
})
const contactData = await resContact.json();
console.log('contact: ', contactData)
contact = contactData;
} else { 
  // check contact match for one time gifts
  const contactQuery = `{
    "groups": [
        {
            "conditions": [
                {
                    "parameter": "Contact Name",
                    "operator": "StartsWith",
                    "value": "${json.payload.first_name}",
                },
                {
                    "parameter": "Contact Name",
                    "operator": "EndsWith",
                    "value": "${json.payload.last_name}"
                }
            ]
        },
        {
            "conditions": [
                {
                    "parameter": "Phone Number",
                    "operator": "Is",
                    "value": "${json.payload.phone}",
                }
            ]
        }, 
        {
          "conditions": [
              {
                  "parameter": "Postal",
                  "operator": "Contains",
                  "value": "${json.payload.address_postal_code}",
              },
              {
                  "parameter": "Address Line 1",
                  "operator": "Contains",
                  "value": "${json.payload.address_line_1}"
              }
          ]
      }
    ],
    "sortBy": "Create Date",
    "descending": "True"
}`
  // search for the contact
  const resSearchContact = await fetch('https://api.virtuoussoftware.com/api/Contact/Query', {
  method: 'POST',
  headers: {
      Authorization: `Bearer ${process.env.VIRTUOUS_API_KEY}`,
      'Content-Type': 'application/json',
  },
  body: contactQuery
})
const contactSearchData = await resSearchContact.json();
console.log('contact: ', contactSearchData)
if (contactSearchData?.list?.length > 0) {
// get the contact so our details are normalized wether or not we had an id from recurring or not
const resContact = await fetch('https://api.virtuoussoftware.com/api/Contact/' + contactSearchData.list[0].id, {
  method: 'GET',
  headers: {
      Authorization: `Bearer ${process.env.VIRTUOUS_API_KEY}`,
      'Content-Type': 'application/json',
  },
})
const contactData = await resContact.json();
console.log('contact: ', contactData)
contact = contactData;
}
}
// calculate contact match
if (contact && contact.id) {
  // we're just going to try to match the first individual, but we could do more here
  contactId = contact.id
  // we have to turn contact nulls into blank strings for the match to work
  contact.contactIndividuals[0].prefix = contact.contactIndividuals[0].prefix || ''
  contact.contactIndividuals[0].suffix = contact.contactIndividuals[0].suffix || ''
  contact.contactIndividuals[0].email = contact.contactIndividuals[0].email || ''
  contact.contactIndividuals[0].phone = contact.contactIndividuals[0].phone || ''
  contact.address.address1 = contact.address.address1 || ''
  contact.address.address2 = contact.address.address2 || ''
  contact.address.city = contact.address.city || ''
  contact.address.state = contact.address.state || ''
  contact.address.country = contact.address.country || ''
  contact.address.postal = contact.address.postal || ''
  console.log('contactMethods: ', contact.contactIndividuals[0].contactMethods)
  // check if phone and email are in contactMethods
  const phoneMatch = contact.contactIndividuals[0]?.contactMethods.filter((method) =>  method.value === json.payload.phone).length > 0
  const emailMatch = contact.contactIndividuals[0]?.contactMethods.filter((method) => method.value === json.payload.email).length > 0
  console.log('phoneMatch: ', phoneMatch)
  console.log('emailMatch: ', emailMatch)


  
  nameMatch = phoneMatch && emailMatch && contact.contactType=== "Household" && contact.contactIndividuals[0].firstName === json.payload.first_name && contact.contactIndividuals[0].lastName === json.payload.last_name  && contact.contactIndividuals[0].prefix === json.payload.title && contact.contactIndividuals[0].suffix === json.payload.suffix
  addressMatch = (contact.address.address1 === json.payload.address_line_1, contact.address.address2 === json.payload.address_line_2 && contact.address.city === json.payload.address_city && contact.address.state === json.payload.address_region && contact.address.country === anedotCountryNormalization[json.payload.address_country] && contact.address.postal === json.payload.address_postal_code)
  if (!nameMatch) {
    phoneMatch ? attentionString = attentionString + "Phone Not Found on Contact" + json.payload.phone + "<br/>"   : null
    emailMatch ? attentionString = attentionString + "Email Not Found on Contact" + json.payload.email + "<br/>"   : null
    contact.contactType !== "Household" ? attentionString = attentionString + "Contact Type:  " + contact.type + 'not equal to Household' + "<br/>"   : null
    contact.contactIndividuals[0].firstName !== json.payload.first_name ? attentionString = attentionString + "First Name:  " + contact.contactIndividuals[0].firstName + 'not equal to ' + json.payload.first_name + "<br/>"   : null
    contact.contactIndividuals[0].lastName !== json.payload.last_name ? attentionString = attentionString + "Last Name:  " + contact.contactIndividuals[0].lastName + 'not equal to ' + json.payload.last_name + "<br/>"   : null
    contact.contactIndividuals[0].prefix !== json.payload.title ? attentionString = attentionString + "Title:  " + contact.contactIndividuals[0].prefix + 'not equal to ' + json.payload.title + "<br/>"   : null
    contact.contactIndividuals[0].suffix !== json.payload.suffix ? attentionString = attentionString + "Suffix:  " + contact.contactIndividuals[0].suffix + 'not equal to ' + json.payload.suffix + "<br/>"   : null
  }

  if (!addressMatch) {
    contact.address.address1 !== json.payload.address_line_1 ? attentionString = attentionString + "Address 1:  " + contact.address.address1 + 'not equal to ' + json.payload.address_line_1 + "<br/>"   : null
    contact.address.address2 !== json.payload.address_line_2 ? attentionString = attentionString + "Address 2:  " + contact.address.address2 + 'not equal to ' + json.payload.address_line_2 + "<br/>"   : null
    contact.address.city !== json.payload.address_city ? attentionString = attentionString + "City:  " + contact.address.city + 'not equal to ' + json.payload.address_city + "<br/>"   : null
    contact.address.state !== json.payload.address_region ? attentionString = attentionString + "State:  " + contact.address.state + 'not equal to ' + json.payload.address_region + "<br/>"   : null
    contact.address.country !== anedotCountryNormalization[json.payload.address_country] ? attentionString = attentionString + "Country:  " + contact.address.country + 'not equal to ' + anedotCountryNormalization[json.payload.address_country] + "<br/>"   : null
    contact.address.postal !== json.payload.address_postal_code ? attentionString = attentionString + "Postal:  " + contact.address.postal + 'not equal to ' + json.payload.address_postal_code + "<br/>"   : null
  }
  
} 

//  calculate match quality
const matchQuality = (projectMatch ? 1 : 0) + (segmentMatch ? 1 : 0) + (nameMatch ? 1 : 0) + (addressMatch ? 1 : 0)
console.log('match quality: ' + matchQuality) 
console.log('attention: ' + attentionString)

// if we found a recurring gift with that commitment ID....lets update the count. 





// should we actually do this as json so we can do some things like unsetting if we don't need to send recurring data

const query = `
  {
    transactionSource: "Anedot${anedotAccountToName[json.payload.account_uid] ? ' - ' + anedotAccountToName[json.payload.account_uid] : ''}",
    transactionId: "${json.payload.donation?.id }-57",
    ${/* this seems to always want to create a recurring, not update it updateRecurring ? 'recurringGiftTransactionUpdate : "TRUE",' : ''*/ ''}
    ${recurringGiftId !== '' && !recurringGiftMatch ? 'recurringGiftTransactionId: "' + recurringGiftId + '",' : ''}
    contact: {
        ${contact && contact.id ? 'id: "' + contact.id + '",' : ''}
        type: "Household",
        title: "${json.payload.title}",
        firstname: "${json.payload.first_name}",
        middlename: "${json.payload.middle_name}",
        lastname: "${json.payload.last_name}",
        suffix: "${json.payload.suffix}",
        ${json.payload.email && blockedEmails.indexOf(json.payload.email) === -1 ?  `email: "${json.payload.email}",` : ''}
        phone: "${json.payload.phone}",
        address: {
            address1: "${json.payload.address_line_1}",
            address2: "${json.payload.address_line_2}",
            city: "${json.payload.address_city}",
            state: "${json.payload.address_region}",
            postal: "${json.payload.address_postal_code}",
            country: "${anedotCountryNormalization[json.payload.address_country]}"
        },
    },
    ${recurringGiftId !== '' && !updateRecurring ? 'frequency: "' + getAnedotFrequencyTypeToVirtuous(json.payload.frequency) +'",' : ''}
    giftDate: "${giftShortDate}",
    giftType: "${getGiftType(json.payload.source)}",
    CreditCardType: "${getCardType(json.payload?.donation?.card_type)}",
    amount: "${json.payload.amount_in_dollars}",
    batch: "Anedot ${shortDate}${matchQuality < 4 ? '- Attention' : ''}",
    segment: "${json.payload?.custom_field_responses?.segment_name || json.payload?.custom_field_responses?.campaign_segment || json.payload?.custom_field_responses?.campaign_segment_  || json.payload?.custom_field_responses?.campaign_source || '' }", 
    recurringGiftSegment:  "${json.payload?.custom_field_responses?.segment_name || json.payload?.custom_field_responses?.campaign_segment || json.payload?.custom_field_responses?.campaign_segment_  || json.payload?.custom_field_responses?.campaign_source || '' }", 
    designations: [
      {
          name: "${json.payload?.donation?.fund.name}",
          amountDesignated: "${json.payload.amount_in_dollars}"
      }
    ],
    
    tribute: "${json.payload.in_honor_of ? "In honor of " +  json.payload.in_honor_of : '' }" ,
    
  customFields: 
  {
      "T Shirt Size": "${json.payload?.custom_field_responses?.tee_shirt_size || ''}",
      "External Unique ID": "${json.payload.account_uid || ''}",
      "Acknowledgment Type" : "General Form",
      "Funding Source": "${json.payload.source_code || ''}",
      "Check Deposited in Phoenix": "False",
      "Anedot Recurring Count" : "${json.payload.commitment_index || ''}",
      "Legacy Recurring ID": "${json.payload.commitment_uid || ''}",  
      "Promotional Item": "${json.payload.custom_field_responses?.promotion_item || ''}",
      "Anedot Action Page": "${json.payload.action_page_name || ''}",
      "Commitment UID": "${json.payload.commitment_uid || ''}",
      "Anedot Action Page Name": "${json.payload.action_page_name || ''}",
      "Donor Comments" : "${json.payload?.comments || ''}",

  },

}
  `;
  const meta= { 
    recurringGiftId: recurringGiftId,
    recurringGiftMatch: recurringGiftMatch,
    projectMatch: projectMatch,
    segmentMatch: segmentMatch,
    nameMatch:  nameMatch,
    addressMatch: addressMatch,
    updateRecurring: updateRecurring,
    attentionString: attentionString,
    projectId:  projectId,
    segmentId: segmentId,
    contactId: contactId, 
    matchQuality: matchQuality,
  }
  console.log(query)
  console.log(meta)
  return({query, meta})

}
