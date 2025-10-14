'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, CheckCircle2, XCircle, Mail, Users, AlertCircle } from 'lucide-react';
import { supabase, Application, QualifiedLead } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { AdminGuard } from '@/components/admin-guard';
import { format } from 'date-fns';

type ApplicationWithLead = Application & {
  lead: QualifiedLead;
};

function AdminDashboardContent() {
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationWithLead[]>([]);
  const [qualifiedLeads, setQualifiedLeads] = useState<QualifiedLead[]>([]);
  const [ineligibleLeads, setIneligibleLeads] = useState<QualifiedLead[]>([]);
  const [selectedApp, setSelectedApp] = useState<ApplicationWithLead | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [availableSlots, setAvailableSlots] = useState(100);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    const { data: apps, error: appsError } = await supabase
      .from('applications')
      .select(`
        *,
        lead:qualified_leads!inner(*)
      `)
      .order('created_at', { ascending: false });

    if (!appsError && apps) {
      const formatted = apps.map((app: any) => ({
        ...app,
        lead: app.lead,
      }));
      setApplications(formatted);

      const approvedCount = formatted.filter(
        (app: ApplicationWithLead) => app.admin_status === 'Approved'
      ).length;
      setAvailableSlots(100 - approvedCount);
    }

    const { data: leads, error: leadsError } = await supabase
      .from('qualified_leads')
      .select('*')
      .eq('application_status', 'Pending')
      .order('created_at', { ascending: false });

    if (!leadsError && leads) {
      setQualifiedLeads(leads);
    }

    const { data: ineligible, error: ineligibleError } = await supabase
      .from('qualified_leads')
      .select('*')
      .eq('application_status', 'Ineligible')
      .order('created_at', { ascending: false });

    if (!ineligibleError && ineligible) {
      setIneligibleLeads(ineligible);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/admin/login');
  };

  const handleReviewClick = (app: ApplicationWithLead) => {
    setSelectedApp(app);
    setAdminNotes(app.admin_notes || '');
    setIsDialogOpen(true);
  };

  const updateApplicationStatus = async (status: 'Approved' | 'Declined') => {
    if (!selectedApp) return;

    setIsUpdating(true);
    const { error } = await supabase
      .from('applications')
      .update({
        admin_status: status,
        admin_notes: adminNotes,
      })
      .eq('id', selectedApp.id);

    if (error) {
      console.error('Error updating application:', error);
      alert('Failed to update application');
    } else {
      await loadAllData();
      setIsDialogOpen(false);
      setSelectedApp(null);
    }
    setIsUpdating(false);
  };

  const pendingApplications = applications.filter(app => app.admin_status === 'Pending Review');
  const approvedApplications = applications.filter(app => app.admin_status === 'Approved');
  const declinedApplications = applications.filter(app => app.admin_status === 'Declined');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case 'Declined':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Declined</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending Review</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-amber-900">Farmchain Coop Admin</h1>
              <p className="text-sm text-gray-600">Membership Management Dashboard</p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-100 mb-1">FOUNDING MEMBERSHIP SLOTS</p>
              <p className="text-5xl font-bold">{availableSlots} / 100</p>
              <p className="text-red-100 mt-2">Available slots remaining</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold mb-2">{100 - availableSlots}</div>
              <p className="text-sm text-red-100">Members Approved</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{applications.length}</div>
              <p className="text-sm text-gray-500 mt-1">All submissions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{pendingApplications.length}</div>
              <p className="text-sm text-gray-500 mt-1">Awaiting decision</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Qualified Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{qualifiedLeads.length}</div>
              <p className="text-sm text-gray-500 mt-1">Not yet applied</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Ineligible</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-400">{ineligibleLeads.length}</div>
              <p className="text-sm text-gray-500 mt-1">Did not qualify</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Application Management</CardTitle>
            <CardDescription>Review and manage membership applications</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="new" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="new">
                  New Applications ({pendingApplications.length})
                </TabsTrigger>
                <TabsTrigger value="qualified">
                  Qualified Leads ({qualifiedLeads.length})
                </TabsTrigger>
                <TabsTrigger value="ineligible">
                  Ineligible Log ({ineligibleLeads.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="new" className="mt-6">
                {pendingApplications.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No pending applications to review</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Applicant Name</TableHead>
                          <TableHead>Financing Track</TableHead>
                          <TableHead>Cattle Committed</TableHead>
                          <TableHead>Submission Date</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingApplications.map((app) => (
                          <TableRow key={app.id}>
                            <TableCell className="font-medium">{app.full_name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{app.lead.finance_track}</Badge>
                            </TableCell>
                            <TableCell>{app.cattle_committed} head</TableCell>
                            <TableCell>{format(new Date(app.created_at), 'MMM d, yyyy')}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="default"
                                size="sm"
                                className="bg-amber-600 hover:bg-amber-700"
                                onClick={() => handleReviewClick(app)}
                              >
                                Review & Decide
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="qualified" className="mt-6">
                {qualifiedLeads.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No qualified leads awaiting application</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Finance Track</TableHead>
                          <TableHead>Qualified Date</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {qualifiedLeads.map((lead) => (
                          <TableRow key={lead.id}>
                            <TableCell className="font-medium">{lead.name}</TableCell>
                            <TableCell>{lead.email}</TableCell>
                            <TableCell>{lead.phone}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{lead.finance_track}</Badge>
                            </TableCell>
                            <TableCell>{format(new Date(lead.eligibility_date), 'MMM d, yyyy')}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" disabled>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Reminder
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="ineligible" className="mt-6">
                {ineligibleLeads.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <XCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No ineligible leads recorded</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Annual Income</TableHead>
                          <TableHead>Test Date</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ineligibleLeads.map((lead) => (
                          <TableRow key={lead.id}>
                            <TableCell className="font-medium">{lead.name}</TableCell>
                            <TableCell>{lead.email}</TableCell>
                            <TableCell>₦{lead.annual_income.toLocaleString()}</TableCell>
                            <TableCell>{format(new Date(lead.created_at), 'MMM d, yyyy')}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" disabled>
                                Export Data
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedApp && (
            <>
              <DialogHeader>
                <DialogTitle>Application Review: {selectedApp.full_name}</DialogTitle>
                <DialogDescription>
                  Complete application details and decision tools
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Full Name</p>
                    <p className="mt-1 font-medium">{selectedApp.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                    <p className="mt-1">{format(new Date(selectedApp.dob), 'MMMM d, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="mt-1">{selectedApp.lead.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="mt-1">{selectedApp.lead.phone}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="mt-1">{selectedApp.address}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Financing Track</p>
                    <Badge className="mt-1" variant="outline">{selectedApp.lead.finance_track}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Annual Income</p>
                    <p className="mt-1 font-semibold">₦{selectedApp.lead.annual_income.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Cattle Committed</p>
                    <p className="mt-1 font-semibold">{selectedApp.cattle_committed} head</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Referral Source</p>
                    <p className="mt-1 capitalize">{selectedApp.referral_source.replace('_', ' ')}</p>
                  </div>
                </div>

                {selectedApp.lead.finance_track === 'Financing' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-3">Financing Track Details</h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Employment Info</p>
                        <p className="mt-1 text-gray-700">{selectedApp.employment_info || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">BVN</p>
                        <p className="mt-1 font-mono">{selectedApp.bvn || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Why Join Farmchain Coop</p>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedApp.lead.why_join}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Membership Expectations</p>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedApp.expectations}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Admin Notes</p>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add internal notes about this application..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => updateApplicationStatus('Approved')}
                    disabled={isUpdating}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve Application
                  </Button>
                  <Button
                    className="flex-1"
                    variant="destructive"
                    onClick={() => updateApplicationStatus('Declined')}
                    disabled={isUpdating}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Decline Application
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminDashboardContent />
    </AdminGuard>
  );
}
