'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';

export default function FullApplicationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadId = searchParams.get('lead_id');

  const [leadData, setLeadData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    address: '',
    dob: '',
    employment_info: '',
    bvn: '',
    cattle_committed: '1',
    expectations: '',
    referral_source: '',
  });

  useEffect(() => {
    if (!leadId) {
      router.push('/');
      return;
    }

    const fetchLeadData = async () => {
      const { data, error } = await supabase
        .from('qualified_leads')
        .select('*')
        .eq('id', leadId)
        .maybeSingle();

      if (error || !data || data.application_status !== 'Pending') {
        router.push('/');
        return;
      }

      setLeadData(data);
      setIsLoading(false);
    };

    fetchLeadData();
  }, [leadId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error: appError } = await supabase.from('applications').insert([
        {
          lead_id: leadId,
          full_name: formData.full_name,
          address: formData.address,
          dob: formData.dob,
          employment_info: formData.employment_info,
          bvn: formData.bvn,
          cattle_committed: parseInt(formData.cattle_committed),
          expectations: formData.expectations,
          referral_source: formData.referral_source,
          admin_status: 'Pending Review',
        },
      ]);

      if (appError) throw appError;

      const { error: updateError } = await supabase
        .from('qualified_leads')
        .update({ application_status: 'Submitted' })
        .eq('id', leadId);

      if (updateError) throw updateError;

      setIsComplete(true);
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
        <nav className="border-b bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/" className="text-2xl font-bold text-amber-900">
              Farmchain Coop
            </Link>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="border-green-200 shadow-xl">
            <CardHeader className="text-center pb-8">
              <div className="flex justify-center mb-6">
                <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-3xl text-green-900">Application Submitted Successfully!</CardTitle>
              <CardDescription className="text-lg mt-4">
                Thank you for completing your Farmchain Coop membership application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-semibold text-green-900 mb-3">What happens next?</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>Our team will carefully review your application within 3-5 business days</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>You'll receive an email at <strong>{leadData?.email}</strong> with our decision</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>If approved, you'll receive instructions for finalizing your membership and cattle ownership</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>A team member may contact you for additional verification if needed</span>
                  </li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <h3 className="font-semibold text-amber-900 mb-2">Membership Slot Reserved</h3>
                <p className="text-gray-700">
                  Your application has secured a temporary hold on one of the 100 founding membership slots.
                  This hold is valid for 14 days pending our review.
                </p>
              </div>

              <div className="flex justify-center pt-4">
                <Link href="/">
                  <Button variant="outline" size="lg">
                    Return to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const needsEmploymentInfo = leadData?.finance_track === 'Financing';

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-2xl font-bold text-amber-900">
            Farmchain Coop
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-amber-900 mb-2">Full Membership Application</h1>
          <p className="text-gray-600">Complete your application to secure your founding membership slot</p>
        </div>

        <Card className="border-2 border-amber-300 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Personal & Commitment Details</CardTitle>
            <CardDescription>
              Provide your complete information to finalize your membership
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Legal Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  placeholder="As it appears on your ID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Physical Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  placeholder="Street address, city, state"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth *</Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  required
                />
              </div>

              {needsEmploymentInfo && (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm font-semibold text-blue-900 mb-1">Financing Track Requirements</p>
                    <p className="text-sm text-gray-700">
                      Since you selected Non-Interest Financing, we need your employment details and BVN for verification.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employment_info">Employment Information *</Label>
                    <Textarea
                      id="employment_info"
                      value={formData.employment_info}
                      onChange={(e) => setFormData({ ...formData, employment_info: e.target.value })}
                      required={needsEmploymentInfo}
                      placeholder="Company name, position, years employed"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bvn">Bank Verification Number (BVN) *</Label>
                    <Input
                      id="bvn"
                      value={formData.bvn}
                      onChange={(e) => setFormData({ ...formData, bvn: e.target.value })}
                      required={needsEmploymentInfo}
                      placeholder="11-digit BVN"
                      maxLength={11}
                      pattern="[0-9]{11}"
                    />
                    <p className="text-sm text-gray-600">Required for identity verification and financing approval</p>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="cattle_committed">How many cattle do you want to commit to? *</Label>
                <Select value={formData.cattle_committed} onValueChange={(value) => setFormData({ ...formData, cattle_committed: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Head of Cattle</SelectItem>
                    <SelectItem value="2">2 Head of Cattle</SelectItem>
                    <SelectItem value="3">3 Head of Cattle</SelectItem>
                    <SelectItem value="4">4 Head of Cattle</SelectItem>
                    <SelectItem value="5">5+ Head of Cattle (Contact for pricing)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600">Estimated cost: ₦800,000 - ₦1,200,000 per head</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectations">What are your expectations from this membership? *</Label>
                <Textarea
                  id="expectations"
                  value={formData.expectations}
                  onChange={(e) => setFormData({ ...formData, expectations: e.target.value })}
                  required
                  placeholder="Describe your goals, timeline, and expected outcomes..."
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="referral_source">How did you hear about Farmchain Coop? *</Label>
                <Select value={formData.referral_source} onValueChange={(value) => setFormData({ ...formData, referral_source: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="social_media">Social Media</SelectItem>
                    <SelectItem value="friend_family">Friend or Family</SelectItem>
                    <SelectItem value="online_search">Online Search</SelectItem>
                    <SelectItem value="advertisement">Advertisement</SelectItem>
                    <SelectItem value="event">Event or Conference</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  By submitting this application, I confirm that all information provided is accurate and complete.
                  I understand that false information may result in application rejection and potential legal action.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-lg py-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting Application...' : 'Submit Full Application'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
