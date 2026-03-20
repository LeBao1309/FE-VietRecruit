const fs = require('fs');
try {
  const t = JSON.parse(fs.readFileSync('api.json', 'utf8'));
  console.log('CheckoutReq:', JSON.stringify(t.components?.schemas?.CheckoutRequest));
  console.log('CheckoutRes:', JSON.stringify(t.components?.schemas?.CheckoutResponse));
  console.log('TxRes:', JSON.stringify(t.components?.schemas?.TransactionResponse));
  console.log('TxPage:', JSON.stringify(t.components?.schemas?.PageTransactionResponse));
  console.log('StatusRes:', JSON.stringify(t.components?.schemas?.PaymentStatusResponse));
} catch(e) {
  console.error(e);
}
