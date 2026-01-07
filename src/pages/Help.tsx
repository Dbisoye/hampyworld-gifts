import { Phone, Mail, MessageCircle, ChevronDown } from 'lucide-react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const Help = () => {
  const faqs = [
    {
      question: 'How can I track my order?',
      answer: 'You can track your order by going to "My Orders" section in your account. Click on the order you want to track and click "Track Order" button to see real-time tracking information.',
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer a 7-day return policy for unused and unopened items. Please contact our support team to initiate a return request.',
    },
    {
      question: 'How long does delivery take?',
      answer: 'Delivery typically takes 3-5 business days depending on your location. You will receive tracking information once your order is shipped.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept Cash on Delivery (COD) and online payments through Razorpay which supports UPI, credit cards, debit cards, and net banking.',
    },
    {
      question: 'How do I cancel my order?',
      answer: 'You can cancel your order before it is shipped by contacting our support team. Once shipped, you will need to wait for delivery and then initiate a return.',
    },
    {
      question: 'Is my personal information secure?',
      answer: 'Yes, we take data security seriously. All your personal information is encrypted and securely stored. We never share your data with third parties.',
    },
  ];

  const handleWhatsApp = () => {
    window.open('https://wa.me/917428601664?text=Hi, I need help with my order', '_blank');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-8">
          Help Centre
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Options */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  className="w-full justify-start gap-3"
                  variant="outline"
                  onClick={handleWhatsApp}
                >
                  <MessageCircle className="w-5 h-5 text-green-500" />
                  Chat on WhatsApp
                </Button>

                <a href="tel:+917428601664" className="block">
                  <Button className="w-full justify-start gap-3" variant="outline">
                    <Phone className="w-5 h-5 text-accent" />
                    Call: +91 7428601664
                  </Button>
                </a>

                <a href="mailto:support@hampyworld.com" className="block">
                  <Button className="w-full justify-start gap-3" variant="outline">
                    <Mail className="w-5 h-5 text-accent" />
                    Email Support
                  </Button>
                </a>
              </CardContent>
            </Card>

            <Card className="glass border-border/50">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-foreground mb-2">Working Hours</h3>
                <p className="text-muted-foreground">Mon - Sun: 10AM - 7PM</p>
              </CardContent>
            </Card>
          </div>

          {/* FAQs */}
          <div className="lg:col-span-2">
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Help;
