import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/common";
import { Users, Search, Plus, Phone, Mail, Calendar } from "lucide-react";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  allergies: string[];
  activePrescriptions: number;
  lastVisit: Date;
}

const mockPatients: Patient[] = [
  {
    id: "p-001",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.j@email.com",
    phone: "(555) 123-4567",
    dateOfBirth: new Date("1985-03-15"),
    allergies: ["Penicillin"],
    activePrescriptions: 2,
    lastVisit: new Date(Date.now() - 2 * 24 * 60 * 60000),
  },
  {
    id: "p-002",
    firstName: "James",
    lastName: "Wilson",
    email: "j.wilson@email.com",
    phone: "(555) 234-5678",
    dateOfBirth: new Date("1972-07-22"),
    allergies: [],
    activePrescriptions: 3,
    lastVisit: new Date(Date.now() - 7 * 24 * 60 * 60000),
  },
  {
    id: "p-003",
    firstName: "Maria",
    lastName: "Garcia",
    email: "m.garcia@email.com",
    phone: "(555) 345-6789",
    dateOfBirth: new Date("1990-11-08"),
    allergies: ["Sulfa", "Aspirin"],
    activePrescriptions: 1,
    lastVisit: new Date(Date.now() - 1 * 24 * 60 * 60000),
  },
  {
    id: "p-004",
    firstName: "Robert",
    lastName: "Brown",
    email: "r.brown@email.com",
    phone: "(555) 456-7890",
    dateOfBirth: new Date("1965-01-30"),
    allergies: [],
    activePrescriptions: 4,
    lastVisit: new Date(Date.now() - 14 * 24 * 60 * 60000),
  },
  {
    id: "p-005",
    firstName: "Emily",
    lastName: "Davis",
    email: "e.davis@email.com",
    phone: "(555) 567-8901",
    dateOfBirth: new Date("1998-05-12"),
    allergies: ["Latex"],
    activePrescriptions: 1,
    lastVisit: new Date(Date.now() - 30 * 24 * 60 * 60000),
  },
];

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function calculateAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export default function PatientsPage() {
  return (
    <div className="space-y-6" data-testid="page-patients">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Patient Directory</h1>
          <p className="text-muted-foreground">Manage patient information and prescription history</p>
        </div>
        <Button data-testid="button-add-patient">
          <Plus className="w-4 h-4 mr-2" />
          Add Patient
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Patients</p>
              <p className="text-2xl font-bold">{mockPatients.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-accent/10">
              <Calendar className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active This Week</p>
              <p className="text-2xl font-bold">3</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-info/10">
              <Mail className="w-6 h-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Follow-ups</p>
              <p className="text-2xl font-bold">12</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>All Patients</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                className="pl-9"
                data-testid="input-search-patients"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockPatients.map((patient) => (
              <div 
                key={patient.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                data-testid={`card-patient-${patient.id}`}
              >
                <div className="flex items-center gap-4">
                  <UserAvatar 
                    name={`${patient.firstName} ${patient.lastName}`} 
                    size="md"
                  />
                  <div>
                    <h3 className="font-medium">
                      {patient.firstName} {patient.lastName}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <span>{calculateAge(patient.dateOfBirth)} years old</span>
                      <span className="hidden sm:inline">|</span>
                      <span className="hidden sm:flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {patient.phone}
                      </span>
                    </div>
                    {patient.allergies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {patient.allergies.map((allergy) => (
                          <Badge key={allergy} variant="destructive" className="text-xs">
                            Allergy: {allergy}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium">{patient.activePrescriptions} active Rx</p>
                  <p className="text-xs text-muted-foreground">
                    Last visit: {formatDate(patient.lastVisit)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
