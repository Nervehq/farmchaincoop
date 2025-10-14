'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function LandingPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    finance_track: 'Purchase' as 'Purchase' | 'Financing',
    annual_income: '',
    why_join: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qualificationStatus, setQualificationStatus] = useState<'idle' | 'qualified' | 'failed'>('idle');
  const [leadId, setLeadId] = useState<string>('');

  const scrollToForm = () => {
    document.getElementById('eligibility-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const income = parseFloat(formData.annual_income);
      const isEligible = income >= 1500000;

      const { data, error } = await supabase
        .from('qualified_leads')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            finance_track: formData.finance_track,
            annual_income: income,
            why_join: formData.why_join,
            application_status: isEligible ? 'Pending' : 'Ineligible',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (isEligible) {
        setQualificationStatus('qualified');
        setLeadId(data.id);
      } else {
        setQualificationStatus('failed');
      }
    } catch (error) {
      console.error('Error submitting eligibility test:', error);
      alert('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <nav className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <span className="text-2xl font-bold text-amber-900">Farmchain Coop</span>
          <Button onClick={scrollToForm} size="lg" className="bg-amber-600 hover:bg-amber-700">
            Test Eligibility
          </Button>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
        <div className="mb-8 inline-block px-4 py-2 bg-red-100 border-2 border-red-500 rounded-lg">
          <p className="text-red-700 font-bold text-sm md:text-base">⚠️ ONLY 100 MEMBERSHIP SLOTS AVAILABLE</p>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
          STOP Investing.<br />START Owning.
        </h1>

        <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-amber-700 mb-8">
          Own Real Cattle. Earn Real Dividends.<br />
          Zero Speculation. 100% Asset-Backed.
        </h2>

        <p className="text-xl md:text-2xl text-gray-700 mb-10 max-w-4xl mx-auto">
          This isn't another investment scheme. It's direct ownership of income-producing cattle
          managed by proven ranch operators. Your name. Your asset. Your profit.
        </p>

        <Button onClick={scrollToForm} size="lg" className="bg-amber-600 hover:bg-amber-700 text-lg px-10 py-7">
          Check If You Qualify <ChevronDown className="ml-2 h-5 w-5" />
        </Button>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl mb-16">
          <img
            src="https://images.pexels.com/photos/422218/pexels-photo-422218.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Cattle grazing on ranch"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">The Arla Foods Blueprint</h2>
          <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
            <p className="text-xl leading-relaxed">
              In 1881, Danish dairy farmers created Arla Foods, a cooperative where farmers directly owned
              the cows producing milk. Today, Arla is worth over <strong>$13 billion</strong>, and its
              10,000+ farmer-owners earn consistent dividends while maintaining full ownership of their livestock.
            </p>
            <p className="text-xl leading-relaxed">
              We're bringing that same proven model to cattle ranching, but with a breakthrough: blockchain
              technology ensures <strong>transparent ownership</strong>, automated dividend distribution, and
              real-time profit tracking. No middlemen. No hidden fees.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">How It Works</h2>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="border-2 border-amber-200">
            <CardHeader>
              <div className="text-4xl font-bold text-amber-600 mb-2">1</div>
              <CardTitle className="text-xl">Direct Ownership</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                You purchase cattle outright or through non-interest financing. The cattle are registered
                in your name on the blockchain with full ownership rights.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-200">
            <CardHeader>
              <div className="text-4xl font-bold text-amber-600 mb-2">2</div>
              <CardTitle className="text-xl">Professional Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Expert ranch operators care for your cattle on proven pastures. You receive monthly reports
                with photos, health updates, and financial performance.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-200">
            <CardHeader>
              <div className="text-4xl font-bold text-amber-600 mb-2">3</div>
              <CardTitle className="text-xl">Earn Dividends</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Receive quarterly dividends from milk, meat, and breeding revenue. Average historical
                returns: 15-22% annually from livestock operations.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-red-50 border-2 border-red-500 rounded-xl p-8 text-center">
          <p className="text-2xl font-bold text-red-700 mb-2">⚠️ SCARCITY WARNING</p>
          <p className="text-lg text-gray-800">
            We are limiting this initial offering to <strong>100 founding members only</strong>. This ensures
            quality management, optimal ranch capacity, and exclusive founding member benefits.
          </p>
        </div>
      </section>

      <section id="eligibility-form" className="bg-gradient-to-b from-amber-50 to-white py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Eligibility Test</h2>
            <p className="text-lg text-gray-600">
              Complete this quick test to see if you qualify for founding membership.
            </p>
          </div>

          {qualificationStatus === 'idle' && (
            <Card className="border-2 border-amber-300 shadow-xl">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="John Smith"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      placeholder="+234 800 000 0000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Financing Choice *</Label>
                    <RadioGroup
                      value={formData.finance_track}
                      onValueChange={(value: 'Purchase' | 'Financing') =>
                        setFormData({ ...formData, finance_track: value })
                      }
                    >
                      <div className="flex items-center space-x-2 border rounded-lg p-4">
                        <RadioGroupItem value="Purchase" id="purchase" />
                        <Label htmlFor="purchase" className="font-normal cursor-pointer flex-1">
                          <div>
                            <p className="font-semibold">Outright Purchase</p>
                            <p className="text-sm text-gray-600">Pay full amount upfront</p>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-4">
                        <RadioGroupItem value="Financing" id="financing" />
                        <Label htmlFor="financing" className="font-normal cursor-pointer flex-1">
                          <div>
                            <p className="font-semibold">Non-Interest Financing</p>
                            <p className="text-sm text-gray-600">Flexible payment plan available</p>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="annual_income">Annual Income (₦) *</Label>
                    <Input
                      id="annual_income"
                      type="number"
                      value={formData.annual_income}
                      onChange={(e) => setFormData({ ...formData, annual_income: e.target.value })}
                      required
                      placeholder="2000000"
                      min="0"
                    />
                    <p className="text-sm text-gray-600">Minimum: ₦1,500,000 per year</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="why_join">Why do you want to join Farmchain Coop? *</Label>
                    <Textarea
                      id="why_join"
                      value={formData.why_join}
                      onChange={(e) => setFormData({ ...formData, why_join: e.target.value })}
                      required
                      placeholder="Tell us about your interest in cattle ownership..."
                      rows={4}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-amber-600 hover:bg-amber-700 text-lg py-6"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Checking Eligibility...' : 'Submit Eligibility Test'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {qualificationStatus === 'qualified' && (
            <Card className="border-2 border-green-500 shadow-xl">
              <CardContent className="pt-8 text-center">
                <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-900 mb-4">Congratulations! You Qualify</h3>
                <p className="text-lg text-gray-700 mb-8">
                  You meet the eligibility requirements for Farmchain Coop founding membership.
                  Complete your full application to secure your slot.
                </p>
                <Link href={`/apply?lead_id=${leadId}`}>
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8 py-6">
                    Complete Full Application →
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {qualificationStatus === 'failed' && (
            <Card className="border-2 border-red-500 shadow-xl">
              <CardContent className="pt-8 text-center">
                <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-red-900 mb-4">Eligibility Requirements Not Met</h3>
                <p className="text-lg text-gray-700 mb-8">
                  Unfortunately, you do not meet the minimum eligibility requirements at this time.
                  Our team is here to help answer any questions.
                </p>
                <div className="flex gap-4 justify-center">
                  <a href="mailto:support@farmchain.coop">
                    <Button variant="outline" size="lg">
                      Email Support
                    </Button>
                  </a>
                  <a href="https://wa.me/2348000000000" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="lg">
                      WhatsApp Support
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
          Frequently Asked Questions
        </h2>

        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="investment" className="border rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold">
              Is this an investment or a purchase?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              This is direct ownership, not an investment. You are purchasing cattle that are registered
              in your name. You own the asset outright, similar to buying real estate or a vehicle. The
              dividends come from the productive use of your cattle (milk, breeding, meat).
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="insurance" className="border rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold">
              Are the cattle insured?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              Yes. Every animal is covered by comprehensive livestock insurance that protects against
              death, disease, and theft. Insurance premiums are included in the management fee.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="management" className="border rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold">
              Who manages the cattle?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              Licensed ranch operators with 15+ years of experience manage all cattle. They handle feeding,
              veterinary care, breeding, and sales. You receive monthly reports with photos and updates.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="returns" className="border rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold">
              What returns can I expect?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              Historical data from similar cooperative ranching models shows 15-22% annual returns from
              combined milk production, breeding fees, and eventual meat sales. Returns vary based on
              market conditions and cattle health. Past performance doesn't guarantee future results.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="visit" className="border rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold">
              Can I visit my cattle?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              Yes! As an owner, you can schedule visits to see your cattle at the ranch. We host quarterly
              member gatherings where you can tour the facilities and meet other members.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="sell" className="border rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold">
              Can I sell my cattle?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              Yes. You can sell your cattle at any time through our marketplace or to other members.
              We also facilitate sales to commercial buyers when you're ready to exit.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <section className="bg-amber-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Secure Your Founding Membership</h2>
          <p className="text-xl mb-8 text-amber-50">
            Join the first 100 members and gain exclusive founding benefits including priority
            dividend distribution and lifetime reduced management fees.
          </p>
          <Button onClick={scrollToForm} size="lg" className="bg-white text-amber-600 hover:bg-amber-50 text-lg px-10 py-7">
            Check Your Eligibility Now
          </Button>
        </div>
      </section>

      <footer className="border-t bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p className="text-xl font-bold text-gray-900 mb-2">Farmchain Coop</p>
          <p className="mb-4">Own Real Cattle. Earn Real Dividends.</p>
          <p className="text-sm">© 2025 Farmchain Coop. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
