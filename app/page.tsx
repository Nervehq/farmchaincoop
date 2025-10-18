'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    contribution_ability: '' as 'Able' | 'Unable' | '',
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
      let isEligible = false;

      // Eligibility rules
      if (formData.finance_track === 'Purchase') {
        isEligible = income >= 1500000;
      } else if (formData.finance_track === 'Financing') {
        isEligible = income >= 1500000 && formData.contribution_ability === 'Able';
      }

      const { data, error } = await supabase
        .from('qualified_leads')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            finance_track: formData.finance_track,
            contribution_ability: formData.contribution_ability,
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
      {/* NAVBAR */}
      <nav className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <span className="text-2xl font-bold text-amber-900">Farmchain Coop</span>
          <Button onClick={scrollToForm} size="lg" className="bg-amber-600 hover:bg-amber-700">
            Test Eligibility
          </Button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
        <div className="mb-8 inline-block px-4 py-2 bg-red-100 border-2 border-red-500 rounded-lg">
          <p className="text-red-700 font-bold text-sm md:text-base">
            🚨 PILOT PHASE OPEN — ONLY 100 CATTLE AVAILABLE
          </p>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
          Own Cattle. Build Wealth.<br />No Guesswork.
        </h1>

        <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-amber-700 mb-8">
          A Smarter Way to Start in Livestock — Without Owning a Ranch
        </h2>

        <p className="text-xl md:text-2xl text-gray-700 mb-10 max-w-4xl mx-auto">
          Join the founding group of <strong>Farmchain Cooperative</strong> and own professionally managed,
          blockchain-tracked cattle. Transparent, insured, and structured — built for first-time livestock owners.
        </p>

        <Button
          onClick={scrollToForm}
          size="lg"
          className="bg-amber-600 hover:bg-amber-700 text-lg px-10 py-7"
        >
          Check If You Qualify <ChevronDown className="ml-2 h-5 w-5" />
        </Button>
      </section>

      {/* IMAGE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl mb-16">
          <img
            src="https://images.pexels.com/photos/422218/pexels-photo-422218.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Cattle grazing on ranch"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">How It Works</h2>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="border-2 border-amber-200">
            <CardHeader>
              <div className="text-4xl font-bold text-amber-600 mb-2">1</div>
              <CardTitle className="text-xl">Join & Own</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Join the cooperative and own at least one cattle — either through outright purchase
                (<strong>₦500,000</strong>) or non-interest financing via our partner bank.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-200">
            <CardHeader>
              <div className="text-4xl font-bold text-amber-600 mb-2">2</div>
              <CardTitle className="text-xl">Fully Managed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                We handle housing, feeding, care, compliance, and traceability — all under professional ranch management. 
                You receive periodic blockchain-verified updates.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-200">
            <CardHeader>
              <div className="text-4xl font-bold text-amber-600 mb-2">3</div>
              <CardTitle className="text-xl">Earn & Grow</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                When your cattle completes its 12-month cycle, you earn your share of profits — transparently tracked and distributed via blockchain.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-red-50 border-2 border-red-500 rounded-xl p-8 text-center">
          <p className="text-2xl font-bold text-red-700 mb-2">⚠️ LIMITED PILOT PHASE</p>
          <p className="text-lg text-gray-800">
            We’re onboarding only <strong>100 cattle</strong> in this pilot phase. Be among the founding owners setting the pace for 
            transparent, tech-enabled livestock wealth building.
          </p>
        </div>
      </section>

      {/* ✅ ELIGIBILITY FORM */}
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
                  {/* NAME */}
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

                  {/* EMAIL */}
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

                  {/* PHONE */}
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

                  {/* FINANCING CHOICE */}
                  <div className="space-y-2">
                    <Label>Financing Choice *</Label>
                    <RadioGroup
                      value={formData.finance_track}
                      onValueChange={(value: 'Purchase' | 'Financing') =>
                        setFormData({ ...formData, finance_track: value, contribution_ability: '' })
                      }
                    >
                      <div className="flex items-center space-x-2 border rounded-lg p-4">
                        <RadioGroupItem value="Purchase" id="purchase" />
                        <Label htmlFor="purchase" className="cursor-pointer flex-1">
                          <p className="font-semibold">Outright Purchase</p>
                          <p className="text-sm text-gray-600">
                            Pay full amount upfront — <strong>₦500,000 per cattle</strong>
                          </p>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-4">
                        <RadioGroupItem value="Financing" id="financing" />
                        <Label htmlFor="financing" className="cursor-pointer flex-1">
                          <p className="font-semibold">Non-Interest Financing</p>
                          <p className="text-sm text-gray-600">Flexible payment plan available</p>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* FINANCING SUB-OPTION */}
                  {formData.finance_track === 'Financing' && (
                    <div className="space-y-2 pl-4 border-l-4 border-amber-400">
                      <Label>Ability to Contribute ₦50,000 Monthly for 12 Months *</Label>
                      <RadioGroup
                        value={formData.contribution_ability}
                        onValueChange={(value: 'Able' | 'Unable') =>
                          setFormData({ ...formData, contribution_ability: value })
                        }
                      >
                        <div className="flex items-center space-x-2 border rounded-lg p-4">
                          <RadioGroupItem value="Able" id="able" />
                          <Label htmlFor="able" className="cursor-pointer flex-1">
                            <p className="font-semibold text-green-700">
                              Yes, I can contribute ₦50,000 monthly for 12 months
                            </p>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 border rounded-lg p-4">
                          <RadioGroupItem value="Unable" id="unable" />
                          <Label htmlFor="unable" className="cursor-pointer flex-1">
                            <p className="font-semibold text-red-700">
                              No, I currently cannot make the ₦50,000 monthly contribution
                            </p>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}

                  {/* ANNUAL INCOME */}
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

                  {/* WHY JOIN */}
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

                  {/* SUBMIT */}
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
                  <a href="mailto:mailingnerve@gmail.com">
                    <Button variant="outline" size="lg">
                      Email Support
                    </Button>
                  </a>
                  <a href="https://wa.me/+2349160426672" target="_blank" rel="noopener noreferrer">
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

      {/* FOOTER */}
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
