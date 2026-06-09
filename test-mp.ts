import { MercadoPagoConfig, Payment } from 'mercadopago';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
const payment = new Payment(client);

async function run() {
  try {
    const beginDate = new Date();
    beginDate.setDate(1); // 1st day of the current month
    beginDate.setHours(0,0,0,0);
    
    const endDate = new Date();
    
    const results = await payment.search({
      options: {
        begin_date: beginDate.toISOString(),
        end_date: endDate.toISOString(),
        status: 'approved',
        limit: 100
      }
    });
    console.log(`Found ${results.results?.length} payments`);
    if (results.results && results.results.length > 0) {
        console.log(results.results[0].transaction_amount);
    }
  } catch(e) {
    console.error(e);
  }
}
run();
