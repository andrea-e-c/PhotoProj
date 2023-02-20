export default function (
  photoUrls,
  names,
  add1 = '',
  add2 = '',
  city = '',
  st = '',
  zip = '',
  shipping = 'Standard',
  size = 'GLOBAL-PHO-4x6',
) {
  let data = {
    merchantReference: 'Add Name and Date Here',
    shippingMethod: 'Budget',
    recipient: {
      name: 'First Last',
      address: {
        line1: '',
        line2: '',
        postalOrZipCode: '',
        countryCode: 'US',
        townOrCity: '',
        stateOrCounty: '',
      },
    },
    items: [],
  };
  if (names) {
    data.recipient.name = names;
  }
  if (shipping) {
    data.shippingMethod = shipping;
  }
  data.recipient.address = {
    line1: add1,
    line2: add2,
    postalOrZipCode: zip,
    countryCode: 'US',
    townOrCity: city,
    stateOrCounty: st,
  };
  if (photoUrls?.length) {
    photoUrls.forEach((element, i) => {
      let asset = {
        merchantReference: `Photo Album image ${i}`,
        sku: size,
        copies: 1,
        sizing: 'fillPrintArea',
        attributes: {
          finish: 'gloss',
        },
        assets: [
          {
            printArea: 'default',
            url: element,
          },
        ],
      };
      return data.items.push(asset);
    });
  }
  return data;
}

// {
//     "merchantReference": "MyMerchantReference1",
//     "shippingMethod": "Overnight",
//     "recipient": {
//         "name": "Mr Testy McTestface",
//         "address": {
//             "line1": "14 test place",
//             "line2": "test",
//             "postalOrZipCode": "12345",
//             "countryCode": "US",
//             "townOrCity": "somewhere",
//             "stateOrCounty": null
//         }
//     },
//     "items": [
//         {
//             "merchantReference": "item #1",
//             "sku": "GLOBAL-CFPM-16X20",
//             "copies": 1,
//             "sizing": "fillPrintArea",
//             "attributes": {
//                 "color": "black"
//             },
//             "recipientCost": {
//                 "amount": "15.00",
//                 "currency": "USD"
//             },
//             "assets": [
//                 {
//                     "printArea": "default",
//                     "url": "https://pwintyimages.blob.core.windows.net/samples/stars/test-sample-grey.png",
//                     "md5Hash": "daa1c811c6038e718a23f0d816914b7b"
//                 }
//             ]
//         }
//     ],
// }
