
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Mail, Clock, Building } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/utils/translations';

const Contact = () => {
  const { language } = useLanguage();
  const t = useTranslation(language);

  return (
    <Layout>
      <section className="bg-white py-12">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-stakerpol-navy">
              {t('contact')}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('contactUs')}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="space-y-6">
              {/* Main Contact */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    {t('contact')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-stakerpol-orange" />
                    <div>
                      <p className="font-semibold">+48 694 133 592</p>
                      <p className="text-sm text-gray-600">Michał Seweryn</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-stakerpol-orange" />
                    <div>
                      <p className="font-semibold">info@stakerpol.pl</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-stakerpol-orange mt-1" />
                    <div>
                      <p className="font-semibold">{t('businessHours')}</p>
                      <p className="text-sm text-gray-600">{t('mondayToFriday')}</p>
                      <p className="text-sm text-gray-600">{t('weekend')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Warehouse Address */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    {t('warehouseAddress')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-stakerpol-orange mt-1" />
                    <div>
                      <p className="font-semibold">ul. Międzyleśna 115</p>
                      <p className="text-sm text-gray-600">32-095 Celiny</p>
                      <p className="text-sm text-gray-600 mt-2">{t('warehouseHours')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Billing Address */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    {t('billingAddress')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-stakerpol-orange mt-1" />
                    <div>
                      <p className="font-semibold">FHU Stakerpol</p>
                      <p className="font-semibold">Michał Seweryn</p>
                      <p className="text-sm text-gray-600">32-043 Skała</p>
                      <p className="text-sm text-gray-600">ul. Szewska 6</p>
                      <p className="text-sm text-gray-600 mt-2">NIP: PL6492111954</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Map */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {t('ourLocation')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative w-full h-[600px] rounded-b-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d2610899.6512577063!2d19.995502000000002!3d50.278735!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x471655f810639623%3A0xc3bcd72bdd0d6aa!2sStakerpol%20Paleciak%20elektryczny%20Bt%20Swe%20200d!5e0!3m2!1spl!2sus!4v1749466251552!5m2!1spl!2sus"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={t('ourLocation')}
                    className="rounded-b-lg"
                  ></iframe>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
