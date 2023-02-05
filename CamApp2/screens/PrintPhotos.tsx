import React, {useState} from 'react';
import {View, Text, StyleSheet, Pressable, Alert} from 'react-native';
import {Link} from '@react-navigation/native';
import {X_Pwinty_REST_API_Key, API_URL} from '@env';
import {useStripe} from '@stripe/stripe-react-native';
import {SelectList} from 'react-native-dropdown-select-list';

export default function PrintPhotos() {
  const {initPaymentSheet, presentPaymentSheet} = useStripe();

  const [loading, setLoading] = useState(false);
  const [photoUrls, setPhotoUrls] = useState([]);
  const [printData, setPrintData] = useState();

  // PRICING STATES
  const [items, setItems] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [taxes, setTaxes] = useState(0);

  // USER DETERMINED OPTIONS
  const [shippingType, setShippingType] = useState('Budget');
  const [photoSize, setPhotoSize] = useState('GLOBAL-PHO-4x6');

  const shipData = [
    {key: '1', value: 'Budget'},
    {key: '2', value: 'Standard'},
    {key: '3', value: 'Express'},
    {key: '4', value: 'Overnight'},
  ];
  const photoSizeData = [
    {key: 'GLOBAL-PHO-4x6', value: '4x6'},
    {key: 'GLOBAL-PHO-5x7', value: '5x7'},
    {key: 'GLOBAL-PHO-8x10', value: '8x10'},
  ];

  const createOrder = async () => {
    fetch('https://api.sandbox.prodigi.com/v4.0/Orders', {
      method: 'POST',
      headers: {
        'X-API-Key': X_Pwinty_REST_API_Key,
        'Content-type': 'application/json',
      },
      body: JSON.stringify(printData),
    })
      .then(res => {
        if (res.ok) {
          console.log('order request successful');
        } else {
          console.log('error', res);
        }
        return res;
      })
      .catch(error => console.error(error));
  };

  const fetchPaymentSheetParams = async (total: string) => {
    const response = await fetch(`${API_URL}/payment-sheet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: total,
      }),
    });
    const {paymentIntent, ephemeralKey, customer} = await response.json();
    return {
      paymentIntent,
      ephemeralKey,
      customer,
    };
  };

  const initializePaymentSheet = async (totalAmt: string) => {
    const {paymentIntent, ephemeralKey, customer} =
      await fetchPaymentSheetParams(totalAmt);
    const {error} = await initPaymentSheet({
      customerId: customer,
      customerEphemeralKeySecret: ephemeralKey,
      paymentIntentClientSecret: paymentIntent,
      allowsDelayedPaymentMethods: false,
    });
    if (!error) {
      setLoading(true);
    }
  };

  const openPaymentSheet = async () => {
    const {error} = await presentPaymentSheet();
    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
    } else {
      Alert.alert('Success! Your order is confirmed.');
      // send order with prodigi
      createOrder();
      // archive album
      // create new album
      // navigate back to home screen
    }
  };

  const fetchQuote = async () => {
    fetch('https://api.sandbox.prodigi.com/v4.0/quotes', {
      method: 'POST',
      headers: {
        'X-API-Key': X_Pwinty_REST_API_Key,
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        shippingMethod: shippingType,
        destinationCountryCode: 'US',
        currencyCode: 'USD',
        items: [
          {
            sku: photoSize,
            copies: 5,
            attributes: {
              finish: 'gloss',
            },
            assets: [{printArea: 'default'}],
          },
        ],
      }),
    })
      .then(res => {
        if (res.ok) {
          console.log('HTTP request successful');
        } else {
          console.log('HTTP request did not succeed');
        }
        return res;
      })
      .then(res => res.json())
      .then(data => {
        setItems(Number(data.quotes[0].costSummary.items.amount));
        setShipping(Number(data.quotes[0].costSummary.shipping.amount));
        setTaxes(Number(data.quotes[0].costSummary.totalCost.amount));
        const totalPrice = (
          Number(data.quotes[0].costSummary.totalCost.amount) * 110
        ).toFixed();
        initializePaymentSheet(totalPrice);
      })
      .catch(error => console.error(error));
  };

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.mainText}>Print Photos Page Here</Text>
      <Link to={{screen: 'Home'}}>Go home</Link>
      <View>
        <Text>Let's put your order together!</Text>
        <Text>Cam-App Standard 5-Photo Album</Text>
        <Text>Shipping method</Text>
        <SelectList
          setSelected={(val: string) => setShippingType(val)}
          data={shipData}
          save="value"
        />
        <Text>Destination country: USA</Text>
        <Text>Photo size</Text>
        <SelectList
          setSelected={(val: string) => setPhotoSize(val)}
          data={photoSizeData}
          save="key"
        />
        <Text>Photo finish: Glossy</Text>
        <Pressable
          style={styles.checkoutButton}
          onPress={() => fetchQuote()}
          disabled={!shippingType}>
          <Text>Get Price</Text>
        </Pressable>
        {items ? (
          <View>
            <Text>Album price: ${items}</Text>
            <Text>Shipping: ${shipping}</Text>
            <Text>Taxes and app fees: ${(taxes * 0.1).toFixed(2)}</Text>
            <Text>Total: ${(taxes + taxes * 0.1).toFixed(2)}</Text>
          </View>
        ) : (
          <Text>Loading price...</Text>
        )}
      </View>
      <Pressable
        style={styles.checkoutButton}
        onPress={() => openPaymentSheet()}>
        {loading ? <Text>Checkout</Text> : <Text>Loading...</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  mainText: {
    color: '#000000',
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#efefef',
    borderRadius: 8,
    fontSize: 20,
    height: 50,
    padding: 10,
    width: '90%',
  },
  card: {
    backgroundColor: '#efefef',
  },
  cardContainer: {
    height: 50,
    width: 300,
  },
  checkoutButton: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    backgroundColor: '#F194FF',
  },
});

/*
Item codes:
4x6 - GLOBAL-PHO-4x6
5x7 - GLOBAL-PHO-5x7
8x10 - GLOBAL-PHO-8x10

Get a quote:
POST https://api.sandbox.prodigi.com/v4.0/quotes
Header
X-API-Key : process.env.X_Pwinty_REST_API_Key
Content-type : application/json
Body
{
	"shippingMethod": "Budget",
	"destinationCountryCode": "US",
	"currencyCode": "USD",
	"items": [
		{
			"sku": "GLOBAL-PHO-8x10-PRO",
			"copies": 2,
			"attributes": {
				"finish": "gloss"
			},
			"assets": [
				{"printArea" : "default"}
			]
		}
	]
}
*/
