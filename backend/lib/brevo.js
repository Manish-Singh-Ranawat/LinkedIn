import SibApiV3Sdk from 'sib-api-v3-sdk';
import { ENV_VARS } from './envVars.js';

const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = ENV_VARS.BREVO_API_KEY;

export const brevoClient = new SibApiV3Sdk.TransactionalEmailsApi();

export const sender = {
  email: ENV_VARS.BREVO_SENDER_EMAIL,
  name: ENV_VARS.BREVO_SENDER_NAME,
};
