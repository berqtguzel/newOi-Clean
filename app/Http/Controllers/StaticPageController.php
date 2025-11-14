<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;

class StaticPageController extends Controller
{
    public function show(string $slug)
    {

        $pages = [

            'uber-uns' => [
                'title'    => 'Über uns',
                'subtitle' => 'Über 25 Jahre Erfahrung in der professionellen Gebäudereinigung.',
                'hero'     => [
                    'image' => '/images/template.jpg',
                    'alt'   => 'Über uns – O&I CLEAN group GmbH',
                ],
                'sections' => [
                    [
                        'heading' => 'Hotelreinigung',
                        'body'    => 'Unser Unternehmen, die Ö&I CLEAN group GmbH, besteht seit über 25 Jahren und ist eines der führenden Gebäudereinigungsunternehmen. In den letzten Jahren haben wir expandiert und sind bundesweit auf dem Markt. Unser Schwerpunkt ist die Hotelreinigung. Wir können zahlreiche große Hotelketten sowie auch private und gewerbliche Firmen zu unserem Kundenkreis zählen.',
                    ],
                    [
                        'heading' => 'Mitarbeiter & Werte',
                        'body'    => 'Wir arbeiten mit mehr als 2000 Mitarbeiterinnen und Mitarbeitern, welche flexibel sind und sich im Laufe der Jahre mit ihrer Arbeit auf ihre Zuverlässigkeit bewiesen haben. Als unser Kunde können Sie spüren, dass wir viel Wert auf nachhaltiges Handeln legen und was wir versprechen, das halten wir auch, denn das unterscheidet uns von anderen Firmen.',
                    ],
                    [
                        'heading' => 'Vertrauen & Leidenschaft',
                        'body'    => 'Vertrauen und Wertschätzung gegenüber den Mitarbeiterinnen und Mitarbeitern und selbstverständlich unserem Kunden gegenüber bilden die grundlegende Basis unseres Unternehmens. Ein Dienstleister mit einem eingespielten Team und Leidenschaft – das steht bei uns im Vordergrund.',
                    ],
                ],
            ],


            'qualitatsmanagement' => [
                'title'    => 'Qualitätsmanagement',
                'subtitle' => 'Qualität ist bei uns mehr als ein Wort – sie ist unsere Verpflichtung.',
                'hero'     => [
                    'image' => '/images/template.jpg',
                    'alt'   => 'Qualitätsmanagement – O&I CLEAN group GmbH',
                ],
                'sections' => [
                    [
                        'heading' => 'Qualität',
                        'body'    => 'In einer Qualitätsüberprüfung stellt man sicher, dass die gewünschten Anforderungen und Wünsche des Kunden tatsächlich übereinstimmen. Die Qualität eines Produkts oder einer gewünschten Dienstleistung ist bei jedem Kunden individuell – sie hängt vom jeweiligen Kunden oder Unternehmen ab. Wir, die Ö&I CLEAN group GmbH, stehen zu unserem Namen: Qualität steht bei uns an erster Stelle.',
                    ],
                ],
            ],


            'mitarbeiter-schulungen' => [
                'title'    => 'Mitarbeiter Schulungen',
                'subtitle' => 'Regelmäßige Schulungen und Weiterbildungen für soziale und fachliche Kompetenzen.',
                'hero'     => [
                    'image' => '//images/template.jpg',
                    'alt'   => 'Mitarbeiter Schulungen – O&I CLEAN group GmbH',
                ],
                'sections' => [
                    [
                        'heading' => 'Überblick',
                        'body'    => 'Die Mitarbeiterschulung eines Unternehmens muss regelmäßig erfolgen. Die Mitarbeitenden werden sowohl in sozialen Kompetenzen als auch in fachlichen Bereichen geschult – sei es von Grund auf oder als Auffrischung. Schulungen können in Einzel- oder Gruppensettings stattfinden.',
                    ],
                ],
            ],


            'haufig-gestellte-fragen-faq' => [
                'title'    => 'Häufig gestellte Fragen (FAQ)',
                'subtitle' => 'Antworten auf die häufigsten Fragen rund um unsere Reinigungsleistungen.',
                'hero'     => [
                    'image' => '/images/template.jpg',
                    'alt'   => 'FAQ – O&I CLEAN group GmbH',
                ],
                'sections' => [
                    [
                        'heading' => 'Warum sind die Grundreinigungen wichtig?',
                        'body'    => 'Die Grundreinigung ist in regelmäßigen Abständen wichtig, da sich in einem Zimmer oder Objekt auch in den kleinsten Ecken Staub oder Schmutz ansammelt, der bei der täglichen Reinigung oft nicht erreicht wird.',
                    ],
                    [
                        'heading' => 'Was versteht man unter einer Unterhaltsreinigung?',
                        'body'    => 'Eine Unterhaltsreinigung betrifft alle öffentlichen Bereiche.',
                    ],
                    [
                        'heading' => 'Wie oft sollte eine Reinigung durchgeführt werden?',
                        'body'    => 'Die normale Reinigung sollte idealerweise täglich stattfinden. Die Grundreinigung sollte in regelmäßigen Abständen erfolgen.',
                    ],
                    [
                        'heading' => 'Warum sollte man auf einen Fachbetrieb zurückgreifen?',
                        'body'    => 'Ein Fachunternehmen verfügt über spezielle Reinigungsverfahren, professionelle Reinigungsmittel und natürlich über die notwendige Erfahrung.',
                    ],
                ],
            ],


            'datenschutz' => [
                'title'    => 'Datenschutzhinweise',
                'subtitle' => 'Der Schutz Ihrer persönlichen Daten ist uns ein besonderes Anliegen.',
                'hero'     => [
                    'image' => '/images/template.jpg',
                    'alt'   => 'Datenschutzhinweise – O&I CLEAN group GmbH',
                ],
                'sections' => [
                    [
                        'heading' => 'Datenschutz-Grundsätze',
                        'body'    => 'Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.',
                    ],
                    [
                        'heading' => 'Datenerhebung & Nutzung',
                        'body'    => 'Die Nutzung unserer Webseite ist in der Regel ohne Angabe personenbezogener Daten möglich. Soweit auf unseren Seiten personenbezogene Daten (beispielsweise Name, Anschrift oder E-Mail-Adressen) erhoben werden, erfolgt dies, soweit möglich, stets auf freiwilliger Basis. Diese Daten werden ohne Ihre ausdrückliche Zustimmung nicht an Dritte weitergegeben.',
                    ],
                    [
                        'heading' => 'Sicherheit der Datenübertragung',
                        'body'    => 'Wir weisen darauf hin, dass die Datenübertragung im Internet (z. B. bei der Kommunikation per E-Mail) Sicherheitslücken aufweisen kann. Ein lückenloser Schutz der Daten vor dem Zugriff durch Dritte ist nicht möglich.',
                    ],
                ],
            ],

            'stockfotos' => [
                'title'    => 'Stockfotos',
                'subtitle' => 'Informationen zu den auf unserer Website verwendeten Bildern.',
                'hero'     => [
                    'image' => '/images/template.jpg',
                    'alt'   => 'Stockfotos – O&I CLEAN group GmbH',
                ],
                'sections' => [
                    [
                        'heading' => 'Lizenzierung',
                        'body'    => 'Alle auf der Website verwendeten Stock-Fotos haben eine „Royalty-free“-Lizenz und wurden von Drittanbietern gegen Zahlung einer Gebühr erworben.',
                    ],
                    [
                        'heading' => 'Rechte',
                        'body'    => 'Alle Rechte vorbehalten.',
                    ],
                    [
                        'heading' => 'Rechtliche Anfragen',
                        'body'    => 'Im Falle einer rechtlichen Anfrage können Sie sich über die Impressum-Seite an die Ö&I CLEAN group GmbH wenden.',
                    ],
                ],
            ],


            'impressum' => [
                'title'    => 'Impressum',
                'subtitle' => 'Angaben gemäß § 5 TMG',
                'hero'     => [
                    'image' => '/images/template.jpg',
                    'alt'   => 'Impressum – O&I CLEAN group GmbH',
                ],
                'sections' => [
                    [
                        'heading' => 'Ö&I Clean GmbH',
                        'body'    => 'Geschäftsführer: Ömer Dogan',
                    ],
                    [
                        'heading' => 'Anschrift',
                        'body'    => "Schnetter Straße 1\n98666 Masserberg\nDeutschland",
                    ],
                    [
                        'heading' => 'Registereintrag',
                        'body'    => 'Amtsgericht Jena, HRB 521053',
                    ],
                    [
                        'heading' => 'USt-IdNr. & Steuernummer',
                        'body'    => 'USt-IdNr.: —\nSteuernummer: —',
                    ],
                    [
                        'heading' => 'Büro Hamburg',
                        'body'    => "Großmannstraße 86\n20539 Hamburg\nDeutschland",
                    ],
                    [
                        'heading' => 'Kontakt',
                        'body'    => "Telefon: +49 (0)36874 38 55 67\nTelefon: +49 (0)36874 38 55 68\nE-Mail: info@oi-clean.de\nWeb: www.oi-clean.de",
                    ],
                    [
                        'heading' => 'Haftungsausschluss',
                        'body'    => 'Für die Richtigkeit der Inhalte wird keine Gewähr übernommen. Links zu externen Webseiten unterliegen der Haftung der jeweiligen Anbieter.',
                    ],
                    [
                        'heading' => 'Urheberrecht',
                        'body'    => 'Alle auf dieser Seite veröffentlichten Inhalte unterliegen dem deutschen Urheberrecht. Unerlaubte Vervielfältigung oder Verbreitung ist nicht gestattet.',
                    ],
                ],
            ],
        ];

        abort_unless(isset($pages[$slug]), 404);

        $page = $pages[$slug];

        $meta = [
            'title'       => ($page['title'] ?? 'Seite') . ' - O&I CLEAN group GmbH',
            'description' => $page['subtitle'] ?? ($page['title'] ?? ''),
            'canonical'   => url()->current(),
        ];

        return Inertia::render('StaticPage', [
            'slug' => $slug,
            'page' => $page,
            'meta' => $meta,
        ]);
    }
}
