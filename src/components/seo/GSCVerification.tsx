import { Helmet } from 'react-helmet-async';

// Google Search Console verification meta tag
// Dodaj swój kod weryfikacji GSC po skonfigurowaniu właściwości
const GSC_VERIFICATION_CODE = process.env.NEXT_PUBLIC_GSC_VERIFICATION || "";

const GSCVerification = () => {
  if (!GSC_VERIFICATION_CODE) {
    return null;
  }

  return (
    <Helmet>
      <meta name="google-site-verification" content={GSC_VERIFICATION_CODE} />
    </Helmet>
  );
};

export default GSCVerification;