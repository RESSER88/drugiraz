// Test bezpośredni Edge Function z konkretnym produktem
const testProduct = {
  product_id: 'b76fcbd2-8fb0-4087-9f96-3897c59ff07c',
  short_description: 'Potrzebujesz wózka wysokiego składowania? Toyota SPE 160L sięga 6000 mm i unosi 1600 kg bez trudu.',
  condition: 'Bateria 90% sprawności',
  drive_type: 'Elektryczny',
  initial_lift: '',
  mast: '',
  wheels: '',
  foldable_platform: '',
  additional_options: '',
  detailed_description: ''
};

console.log('🧪 TEST: Sending direct request to Edge Function');
console.log('📋 Test Product Data:', testProduct);

// Test wykonania
fetch('https://peztqgfmmnxaaoapzpbw.supabase.co/functions/v1/auto-translate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlenRxZ2ZtbW54YWFvYXB6cGJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NDU3NDAsImV4cCI6MjA2NjAyMTc0MH0.wXaJlrVMbf1z2egXCpdQUxTLv_dM9bswaZkOt6fLr-g'
  },
  body: JSON.stringify({
    action: 'translate_product_fields',
    product_id: testProduct.product_id,
    ...testProduct
  })
})
.then(response => {
  console.log('📊 Response Status:', response.status);
  return response.json();
})
.then(data => {
  console.log('📊 Response Data:', data);
})
.catch(error => {
  console.error('❌ Test Error:', error);
});