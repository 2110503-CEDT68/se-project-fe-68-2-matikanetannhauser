'use client'
import { Button } from "./ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "./ui/DefaultCard";

export default function PolicyCard({action}:{action:() => void}) {
    return (
        <div className="z-50 fixed inset-0 bg-black/50 flex justify-center items-center h-dvh w-dvw">
            <Card>
                <CardHeader>
                    <h1 className="font-bold">Privacy Policy</h1>
                    <p>We value your privacy and are committed to protecting your personal data.</p>
                </CardHeader>
                <CardContent>
                    <div>
                        <h1 className="font-bold">1. Information We Collect</h1>
                        <p>We collect the following personal information when you register and use our system:</p>
                        <ul className="list-disc list-inside pl-5">
                            <li>Name</li>
                            <li>Email address</li>
                            <li>Phone Number</li>
                            <li>Account credentials (password is securely stored in hashed form and is not readable)</li>
                        </ul>
                    </div>
                    <div>
                        <h1 className="font-bold">2. Purpose of Data Collection</h1>
                        <p>Your personal data is collected and used for the following purposes:</p>
                        <ul className="list-disc list-inside pl-5">
                            <li>To create and manage your account</li>
                            <li>To provide and maintain our services</li>
                            <li>To contact you regarding your account or service updates</li>
                            <li>To ensure security and prevent unauthorized access</li>
                        </ul>
                    </div>
                    <div>
                        <h1 className="font-bold">3. Data Storage and Security</h1>
                        <p>We implement appropriate security measures to protect your personal data. Passwords are not stored in plain text and are securely hashed.</p>
                    </div>
                    <div>
                        <h1 className="font-bold">4. Data Sharing</h1>
                        <p>We do not sell or share your personal data with third parties, except:</p>
                        <ul className="list-disc list-inside pl-5">
                            <li>When required by law</li>
                            <li>When necessary to provide our services (e.g., service providers under confidentiality obligations)</li>
                        </ul>
                    </div>
                    <div>
                        <h1 className="font-bold">5. Data Retention</h1>
                        <p>We retain your personal data only as long as necessary to fulfill the purposes outlined in this policy or as required by law.</p>
                        <ul className="list-disc list-inside pl-5">
                            <li>To create and manage your account</li>
                            <li>To provide and maintain our services</li>
                            <li>To contact you regarding your account or service updates</li>
                            <li>To ensure security and prevent unauthorized access</li>
                        </ul>
                    </div>
                    <div>
                        <h1 className="font-bold">6. Your Rights</h1>
                        <p>You have the right to:</p>
                        <ul className="list-disc list-inside pl-5">
                            <li>Access your personal data</li>
                            <li>Request correction of inaccurate data</li>
                            <li>Request deletion of your data</li>
                            <li>Withdraw your consent (which may affect your ability to use the service)</li>
                        </ul>
                    </div>
                    <div>
                        <h1 className="font-bold">7. Contact Us</h1>
                        <p>If you have any questions or requests regarding your data, please contact: mambo.foodcourt@gmail.com.</p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={action}>I have read and agree</Button>
                </CardFooter>
            </Card>
        </div>
    )
}