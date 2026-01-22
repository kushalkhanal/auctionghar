const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Test eSewa configuration
console.log('=== eSewa Configuration Test ===');

// Check environment variables
const {
    ESEWA_MERCHANT_CODE,
    ESEWA_MERCHANT_SECRET,
    ESEWA_API_URL,
    ESEWA_VERIFY_URL,
    FRONTEND_URL
} = process.env;

console.log('Environment Variables:');
console.log('ESEWA_MERCHANT_CODE:', ESEWA_MERCHANT_CODE);
console.log('ESEWA_MERCHANT_SECRET:', ESEWA_MERCHANT_SECRET ? '***SET***' : 'NOT SET');
console.log('ESEWA_API_URL:', ESEWA_API_URL);
console.log('ESEWA_VERIFY_URL:', ESEWA_VERIFY_URL);
console.log('FRONTEND_URL:', FRONTEND_URL);

// Test signature generation
const testAmount = 100;
const testTransactionUuid = uuidv4();

console.log('\n=== Signature Generation Test ===');
console.log('Test Amount:', testAmount);
console.log('Test Transaction UUID:', testTransactionUuid);

const message = `total_amount=${testAmount},transaction_uuid=${testTransactionUuid},product_code=${ESEWA_MERCHANT_CODE}`;
console.log('Signature Message:', message);

const hmac = crypto.createHmac('sha256', ESEWA_MERCHANT_SECRET);
hmac.update(message);
const signature = hmac.digest('base64');

console.log('Generated Signature:', signature);

// Test form data
const formData = {
    amount: testAmount.toString(),
    tax_amount: "0",
    total_amount: testAmount.toString(),
    transaction_uuid: testTransactionUuid,
    product_code: ESEWA_MERCHANT_CODE,
    product_service_charge: "0",
    product_delivery_charge: "0",
    signed_field_names: "total_amount,transaction_uuid,product_code",
    signature,
    success_url: `${FRONTEND_URL}/payment/success`,
    failure_url: `${FRONTEND_URL}/payment/failure`,
};

console.log('\n=== Form Data Test ===');
console.log('Form Data:', JSON.stringify(formData, null, 2));

console.log('\n=== Test Complete ==='); 