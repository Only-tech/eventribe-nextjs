import { ArrowUpIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export const metadata = {
  title: 'Mentions Légales - eventribe',
  description: 'Informations légales et politique de confidentialité du site eventribe',
};

export default function LegalMentionsPage() {
  const lastUpdateDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <>
      <section className="max-w-4xl mx-auto -mt-15 bg-[rgb(248,248,236)] dark:bg-[#1E1E1E] dark:text-gray-300 p-8 rounded-lg shadow-lg dark:hover:shadow-[0px_1px_5px_rgba(255,_255,_255,_0.4)] dark:shadow-[0px_1px_1px_rgba(255,_255,_255,_0.2)]">
        <Link href="/events" className="absolute h-11 inline-flex items-center justify-center -mt-13 px-5 py-2 rounded-full text-base text-[#FFF] hover:text-[#ff952aff] font-medium transition-colors group border-[0.5px] border-transparent shadow-sm shadow-[hsl(var(--always-black)/5.1%)] bg-gray-800 hover:bg-[#FFF] hover:border-[#ff952aff] cursor-pointer duration-300 ease-in-out">
          <ArrowUpIcon className="inline-block w-4 h-4 mr-2 rotate-270 group-hover:animate-bounce" />
          <span>Page d&apos;accueil</span>
        </Link>

        <h1 className="text-4xl font-extrabrabold text-gray-900 dark:text-white mb-6 text-center">Mentions Légales</h1>

        <div className="mb-8">
          <h2 className="section-title text-2xl font-bold text-gray-800 dark:text-white/70 mb-3">
            <span className="section-number">1.</span> <span className="section-text">Informations Légales</span>
          </h2>
          <p className="mb-2"><strong>Nom du Site Web :</strong> eventribe</p>
          <p className="mb-2"><strong>URL :</strong> https://www.eventribe.vercel.app</p>
          <p className="mb-2"><strong>Propriétaire du Site :</strong> Cédrick F.</p>
          <p className="mb-2"><strong>Statut juridique :</strong> SARL</p>
          <p className="mb-2"><strong>Adresse :</strong> Nevers, France</p>
          <p className="mb-2"><strong>Email :</strong> contact@eventribe.site</p>
          <p className="mb-2"><strong>Téléphone :</strong> +33 1 23 45 67 89</p>
          <p className="mb-2"><strong>Numéro SIRET :</strong> 367905846484949474648567A</p>
          <p className="mb-2"><strong>Numéro de TVA intracommunautaire :</strong> 342534567457599034</p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/70 mb-3">2. Hébergement</h2>
          <p className="mb-2"><strong>Hébergeur :</strong> DigitalOcean</p>
          <p className="mb-2"><strong>Adresse de l&apos;hébergeur :</strong> New York, États-Unis</p>
          <p className="mb-2"><strong>Téléphone de l&apos;hébergeur :</strong> +1 1 23 45 67 89</p>
        </div>

        <div className="mb-8">
          <h2 className="flex flex-row gap-2 text-2xl font-bold text-gray-800 dark:text-white/70 mb-3">
            <span className="max-w-fit w-fit">3.</span>
            <span>Propriété Intellectuelle</span>
          </h2>
          <p className="mb-2">Le contenu du site eventribe (textes, images, graphismes, logo, icônes, sons, logiciels, etc.) est la propriété exclusive de Cédrick F., sauf mentions contraires. Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de Cédrick.</p>
          <p>Toute exploitation non autorisée du site ou de l&apos;un quelconque des éléments qu&apos;il contient sera considérée comme constitutive d&apos;une contrefaçon et poursuivie conformément aux dispositions des articles L.335-2 et suivants du Code de Propriété Intellectuelle.</p>
        </div>

        <div className="mb-8">
          <h2 className="flex flex-row gap-2 text-2xl font-bold text-gray-800 dark:text-white/70 mb-3">
            <span className="max-w-fit w-fit">4.</span> <span>Limitations de Responsabilité</span>
          </h2>
          <p className="mb-2">eventribe ne pourra être tenu responsable des dommages directs et indirects causés au matériel de l&apos;utilisateur, lors de l&apos;accès au site eventribe, et résultant soit de l&apos;utilisation d&apos;un matériel ne répondant pas aux spécifications indiquées au point 4, soit de l&apos;apparition d&apos;un bug ou d&apos;une incompatibilité.</p>
          <p className="mb-2">eventribe ne pourra également être tenu responsable des dommages indirects (tels par exemple qu&apos;une perte de marché ou perte d&apos;une chance) consécutifs à l&apos;utilisation du site.</p>
          <p>Des espaces interactifs (possibilité de poser des questions dans l&apos;espace contact) sont à la disposition des utilisateurs. eventribe se réserve le droit de supprimer, sans mise en demeure préalable, tout contenu déposé dans cet espace qui contreviendrait à la législation applicable en France, en particulier aux dispositions relatives à la protection des données.</p>
          <p>Le cas échéant, eventribe se réserve également la possibilité de mettre en cause la responsabilité civile et/ou pénale de l&apos;utilisateur, notamment en cas de message à caractère raciste, injurieux, diffamant, ou pornographique, quel que soit le support utilisé (texte, photographie…).</p>
        </div>

        <div className="mb-8">
          <h2 className="flex flex-row gap-2 text-2xl font-bold text-gray-800 dark:text-white/70 mb-3">
            <span className="max-w-fit w-fit">5.</span>
            <span>Gestion des Données Personnelles</span>
          </h2>
          <p className="mb-2" id="cookies">Conformément aux dispositions de la loi 78-17 du 6 janvier 1978 modifiée, l&apos;utilisateur du site eventribe dispose d&apos;un droit d&apos;accès, de modification et de suppression des informations collectées. Pour exercer ce droit, envoyez un message à : contact@eventribe.site.</p>
          <p>Pour plus d&apos;informations sur la manière dont nous traitons vos données personnelles (type de données, finalité, destinataire...), lisez notre <Link href="#politique-confidentialite" className="text-[#ff952aff] hover:underline">Politique de Confidentialité</Link></p>
        </div>

        <div></div>

        <div className="mb-8">
          <h2 className="flex flex-row gap-2 text-2xl font-bold text-gray-800 dark:text-white/70 mb-3">
            <span className="max-w-fit w-fit">6.</span>
            <span>Liens Hypertextes et Cookies</span>
          </h2>
          <p className="mb-2">Le site eventribe contient des liens hypertextes vers d&apos;autres sites et dégage toute responsabilité à propos de ces liens externes ou des liens créés par d&apos;autres sites vers eventribe.</p>
          <p>La navigation sur le site eventribe est susceptible de provoquer l&apos;installation de cookie(s) sur l&apos;ordinateur de l&apos;utilisateur. Un cookie est un fichier de petite taille qui enregistre des informations relatives à la navigation d&apos;un utilisateur sur un site. Les données ainsi obtenues permettent d&apos;obtenir des mesures de fréquentation, par exemple.</p>
          <p>Vous avez la possibilité d&apos;accepter ou de refuser les cookies en modifiant les paramètres de votre navigateur. Le refus d&apos;installation d&apos;un cookie peut entraîner l&apos;impossibilité d&apos;accéder à certains services. Pour plus d&apos;informations sur la manière dont nous utilisons les cookies, lisez notre <Link href="#politique-confidentialite" className="text-[#ff952aff] hover:underline">Politique de Confidentialité</Link>.</p>
        </div>

        <div className="mb-8">
          <h2 className="flex flex-row gap-2 text-2xl font-bold text-gray-800 dark:text-white/70 mb-3">
            <span className="max-w-fit w-fit">7.</span>
            <span>Droit Applicable et Attribution de Juridiction</span>
          </h2>
          <p>Tout litige en relation avec &apos;utilisation du site eventribe est soumis au droit français. En dehors des cas où la loi ne le permet pas, il est fait attribution exclusive de juridiction aux tribunaux compétents de Nevers.</p>
        </div>
        <Link href="/events" className="absolute  h-11 inline-flex items-center justify-center mt-3 px-5 py-2 rounded-full text-base text-[#FFF] hover:text-[#ff952aff] font-medium transition-colors group border-[0.5px] border-transparent shadow-sm shadow-[hsl(var(--always-black)/5.1%)] bg-gray-800 hover:bg-[#FFF] hover:border-[#ff952aff] cursor-pointer duration-300 ease-in-out">
          <ArrowUpIcon className="inline-block w-4 h-4 mr-2 rotate-270 group-hover:animate-bounce" />
          <span>Page d&apos;accueil</span>
        </Link>
      </section>


      <section id="politique-confidentialite" className="max-w-4xl mx-auto bg-[rgb(248,248,236)] dark:bg-[#1E1E1E] dark:text-gray-300 p-20 px-8 mt-200 rounded-lg shadow-lg dark:hover:shadow-[0px_1px_5px_rgba(255,_255,_255,_0.4)] dark:shadow-[0px_1px_1px_rgba(255,_255,_255,_0.2)]">
        <h1 className="text-4xl font-extrabrabold text-gray-900 dark:text-white mb-8 text-center">Politique de Confidentialité</h1>

        <p className="mb-4">Dernière mise à jour : {lastUpdateDate}</p>

        <p className="mb-8">Nous nous engageons à protéger votre vie privée. Cette section détaille comment nous collectons, utilisons et protégeons les informations personnelles que vous nous fournissez sur eventribe.</p>

        <div className="mb-8">
          <h2 className="flex flex-row gap-2 text-2xl font-bold text-gray-800 dark:text-white/70 mb-3">
            <span className="max-w-fit w-fit">1.</span>
            <span>Données collectées</span>
          </h2>
          <p className="mb-2">Nous collectons les données suivantes :</p>
          <ul className="list-disc list-inside ml-4 mb-4">
            <li><strong>Informations d&apos;inscription :</strong> Lors de votre inscription, nous recueillons votre nom d&apos;utilisateur, votre adresse email et votre mot de passe (haché).</li>
            <li><strong>Informations sur les événements :</strong> Lorsque vous vous inscrivez à un événement, nous collectons des données liées à cet événement et à votre participation (ex: ID de l&apos;événement, date d&apos;inscription).</li>
            <li><strong>Données de navigation :</strong> Nous collectons des informations anonymes sur votre utilisation du site via des cookies (voir section 6 sur <Link href="#cookies" className="text-[#ff952aff] hover:underline">les Cookies</Link>), telles que les pages visitées, le temps passé sur le site, l&apos;adresse IP (anonymisée), le type de navigateur.</li>
            <li><strong>Communications :</strong> Si vous nous contactez (via formulaire de contact, email), nous conservons les informations relatives à ces échanges.</li>
          </ul>
        </div>

        <div className="mb-8">
          <h2 className="flex flex-row gap-2 text-2xl font-bold text-gray-800 dark:text-white/70 mb-3">
            <span className="max-w-fit w-fit">2.</span>
            <span>Finalité de la collecte</span>
          </h2>
          <p className="mb-2">Les données collectées sont utilisées pour :</p>
          <ul className="list-disc list-inside ml-4 mb-4">
            <li>Fournir et gérer les services du site (création de compte, inscription/désinscription aux événements).</li>
            <li>Personnaliser votre expérience utilisateur.</li>
            <li>Améliorer nos services et le fonctionnement du site.</li>
            <li>Communiquer avec vous concernant votre compte ou les événements.</li>
            <li>Assurer la sécurité du site et prévenir les fraudes.</li>
            <li>Répondre à des obligations légales ou réglementaires.</li>
          </ul>
        </div>

        <div className="mb-8">
          <h2 className="flex flex-row gap-2 text-2xl font-bold text-gray-800 dark:text-white/70 mb-3">
            <span className="max-w-fit w-fit">3.</span>
            <span>Destinataires des données</span>
          </h2>
          <p className="mb-2">Vos données personnelles sont destinées uniquement à Cédrick F. (le propriétaire du site) et ne sont pas vendues, louées ou échangées avec des tiers à des fins commerciales. Elles peuvent être partagées avec des prestataires techniques (hébergeur, services de maintenance) dans la stricte mesure nécessaire à l&apos;exécution de leurs missions et dans le respect de la confidentialité.</p>
        </div>

        <div className="mb-8">
          <h2 className="flex flex-row gap-2 text-2xl font-bold text-gray-800 dark:text-white/70 mb-3">
            <span className="max-w-fit w-fit">4.</span>
            <span>Durée de conservation</span>
          </h2>
          <p className="mb-2">Nous conservons vos données personnelles aussi longtemps que nécessaire pour les finalités pour lesquelles elles ont été collectées, y compris pour satisfaire à des exigences légales, comptables ou de rapport. Généralement :</p>
          <ul className="list-disc list-inside ml-4 mb-4">
            <li>Les données de votre compte sont conservées tant que votre compte est actif.</li>
            <li>Les données d&apos;événements sont conservées tant que l&apos;événement est pertinent ou pour une durée nécessaire à des fins d&apos;historique ou légales.</li>
            <li>Les données de connexion et d&apos;utilisation peuvent être conservées pour des durées plus courtes à des fins de sécurité et d&apos;analyse.</li>
          </ul>
        </div>

        <div className="mb-8">
          <h2 className="flex flex-row gap-2 text-2xl font-bold text-gray-800 dark:text-white/70 mb-3">
            <span className="max-w-fit w-fit">5.</span>
            <span>Sécurité des données</span>
          </h2>
          <p className="mb-2">Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données personnelles contre la perte, l&apos;abus, l&apos;accès non autorisé, la divulgation, l&apos;altération ou la destruction. Cela inclut le chiffrement des données de connexion, des pare-feu et des contrôles d&apos;accès.</p>
        </div>

        <div className="mb-8">
          <h2 className="flex flex-row gap-2 text-2xl font-bold text-gray-800 dark:text-white/70 mb-3">
            <span className="max-w-fit w-fit">6.</span>
            <span>Vos droits</span>
          </h2>
          <p className="mb-2">Conformément au RGPD, vous disposez des droits suivants concernant vos données personnelles :</p>
          <ul className="list-disc list-inside ml-4 mb-4">
            <li><strong>Droit d&apos;accès :</strong> Obtenir la confirmation que vos données sont traitées et, le cas échéant, y accéder.</li>
            <li><strong>Droit de rectification :</strong> Demander la correction de données inexactes ou incomplètes.</li>
            <li><strong>Droit à l&apos;effacement (droit à l&apos;oubli) :</strong> Demander la suppression de vos données dans certaines conditions.</li>
            <li><strong>Droit à la limitation du traitement :</strong> Demander la limitation du traitement de vos données.</li>
            <li><strong>Droit d&apos;opposition :</strong> Vous opposer au traitement de vos données.</li>
            <li><strong>Droit à la portabilité :</strong> Recevoir les données que vous nous avez fournies, dans un format structuré, couramment utilisé et lisible par machine.</li>
            <li><strong>Droit de retirer votre consentement :</strong> Retirer votre consentement à tout moment, lorsque le traitement est basé sur celui-ci.</li>
            <li><strong>Droit d&apos;introduire une réclamation :</strong> Si vous estimez que vos droits n&apos;ont pas été respectés, vous avez le droit d&apos;introduire une réclamation auprès de l&apos;autorité de contrôle compétente (en France, la CNIL).</li>
          </ul>
          <p>Pour exercer ces droits, veuillez nous contacter à contact@eventribe.site.</p>
        </div>
        <Link href="/events" className="absolute  h-11 inline-flex items-center justify-center mt-15 px-5 py-2 rounded-full text-base text-[#FFF] hover:text-[#ff952aff] font-medium transition-colors group border-[0.5px] border-transparent shadow-sm shadow-[hsl(var(--always-black)/5.1%)] bg-gray-800 hover:bg-[#FFF] hover:border-[#ff952aff] cursor-pointer duration-300 ease-in-out">
          <ArrowUpIcon className="inline-block w-4 h-4 mr-2 rotate-270 group-hover:animate-bounce" />
          <span>Page d&apos;accueil</span>
        </Link>
      </section>
    </>
  );
}
