import PageWrapper from '@components/PageWrapper';
import { TypographyH2 } from '@components/ui/Typography';
import { AvatarImage } from '@/components/ui/avatar';
import { AvatarFallback } from '@/components/ui/avatar';
import { Avatar } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { redirect } from 'next/navigation';
import { Mail, User, Shield, Calendar } from 'lucide-react';
import { UserRoles } from '@/types/user-roles';

export const revalidate = 2;

export default async function Profile() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/signin');
  }

  const { user } = session;
  const initials = user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  const joinDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <main>
      <PageWrapper>
        <div className="col-span-4 space-y-8">


          {/* Profile Card */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={user.image || ''}
                    alt={user.name || 'User avatar'}
                  />
                  <AvatarFallback className="text-2xl font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left space-y-2">
                  <CardTitle className="text-2xl">{user.name}</CardTitle>
                  <div className="flex justify-center sm:justify-start">
                    <Badge 
                      variant={user.role === UserRoles.ADMIN ? "default" : "secondary"}
                      className="flex items-center gap-1"
                    >
                      <Shield className="h-3 w-3" />
                      {user.role === UserRoles.ADMIN ? 'Administrator' : 'User'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Email Address</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Member Since</p>
                        <p className="text-sm text-muted-foreground">{joinDate}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Account Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="h-4 w-4 rounded-full bg-green-500" />
                      <div>
                        <p className="text-sm font-medium">Account Status</p>
                        <p className="text-sm text-muted-foreground">Active</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Role</p>
                        <p className="text-sm text-muted-foreground">
                          {user.role === UserRoles.ADMIN ? 'Administrator' : 'Standard User'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info Card */}
          {user.role === UserRoles.ADMIN && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Administrator Access
                </CardTitle>
                <CardDescription>
                  You have administrative privileges on this platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  Access to admin dashboard and system management
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </PageWrapper>
    </main>
  );
}
