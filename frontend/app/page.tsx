import Link from "next/link";
import Logo2 from "@/app/components/Logo/logo3"; 
import { ANCHOR_IDS, siteTexts } from "./constants/string";
import React from "react";
import SamandehiLogo from "./components/shared/shamadlogo";
export default function Landingpage() {
  return (
    <>
   
      <header className="fixed z-10 w-full bg-white">
        <nav className="flex justify-between items-center h-24 px-4 sm:px-8 md:px-16 lg:px-32 shadow-lg shadow-[#1C4A610D]">
          <ul className="flex items-center gap-4 md:gap-8">
            <li>
              <Link href="/"> {/* لینک به صفحه اصلی */}
                <Logo2 />
              </Link>
            </li>
            <li>
              <Link
                className="text-gray-medium  hidden text-sm md:text-xl VazirFontMedium hover:text-purple-medium transition-all"
                href={`#${ANCHOR_IDS.ABOUT_US}`}
              >
                {siteTexts.header.navLinks.aboutUs}
              </Link>
            </li>
            <li>
              <Link
                className="text-gray-medium text-sm hidden md:text-xl VazirFontMedium hover:text-purple-medium transition-all"
                href={`#${ANCHOR_IDS.SERVICES}`}
              >
                {siteTexts.header.navLinks.services}
              </Link>
            </li>
            <li>
              <Link
                className="text-gray-medium hidden text-sm md:text-xl VazirFontMedium hover:text-purple-medium transition-all"
                href={`#${ANCHOR_IDS.CONTACT_US}`}
              >
                {siteTexts.header.navLinks.contactUs}
              </Link>
            </li>
          </ul>
          <Link
            className="text-purple-dark text-base md:text-xl VazirFontMedium"
            href="/auth/login" // مسیر ورود/ثبت نام
          >
            {siteTexts.header.authButton}
          </Link>
        </nav>
      </header>
      <main className="flex flex-col landing-bg bg-contain bg-no-repeat text-gray-ultra-dark">
        {/* Hero Section */}
        <section className="flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-8 lg:gap-20 xl:gap-80 mt-24 pt-[150px] md:pt-[207px] px-4 sm:px-8 md:px-16 lg:px-32">
          <div className="max-w-md lg:max-w-xl text-center lg:text-right">
            <h1 className="text-4xl sm:text-5xl md:text-[64px] leading-tight md:leading-loose">
              <span className="text-blue-dark">{siteTexts.hero.titleHighlight}</span>
            </h1>
            <p className="text-xl sm:text-2xl md:text-[32px] leading-relaxed opacity-90 mt-4">
              {siteTexts.hero.mainSloganLines.map((line, index) => (
                <React.Fragment key={`main-slogan-${index}`}>
                  {line}
                  {index < siteTexts.hero.mainSloganLines.length - 1 && <br />}
                </React.Fragment>
              ))}
            </p>
            <p className="text-xl sm:text-2xl md:text-[32px] leading-relaxed opacity-60 mt-4">
              {siteTexts.hero.secondarySloganLines.map((line, index) => (
                <React.Fragment key={`secondary-slogan-${index}`}>
                  {line}
                  {index < siteTexts.hero.secondarySloganLines.length - 1 && <br />}
                </React.Fragment>
              ))}
            </p>
          </div>
          <img className="levitating-mobile w-2/3 sm:w-1/2 lg:w-auto" src="/mobile-banner.svg" draggable={false} alt="اپلیکیشن موبایل نرخین" />
        </section>

        {/* فضاهای خالی برای اسکرول، می‌توانید با margin/padding دقیق‌تر کنترل کنید */}
        <div className="h-20 md:h-40"></div>

        {/* About Us Section */}
        <section className="mt-10 md:mt-20 w-full relative px-4 sm:px-8 md:px-16 lg:px-32">
          <div id={ANCHOR_IDS.ABOUT_US} className="absolute -top-24 md:-top-28"></div>
          <div className="flex flex-col items-center gap-4 md:gap-8">
            <h2 className="text-3xl sm:text-4xl md:text-[64px] VazirFontBold leading-none text-center">
              {siteTexts.aboutUs.sectionTitle}
            </h2>
            <div className="w-24 md:w-[143px] h-4 md:h-6 bg-white-light rounded-[17px]"></div>
          </div>
          <div className="flex flex-col items-center mt-8 md:mt-12">
            <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-20">
              <div className="flex-shrink-0">
                <img src="/landing-features-1.svg" alt="ویژگی‌های نرخین - درباره ما" className="max-w-xs md:max-w-sm lg:max-w-none"/>
              </div>
              <div className="flex flex-col gap-3 text-center lg:text-right">
                <div className="flex items-center justify-center lg:justify-start gap-4">
                  <div className="size-4 md:size-6 bg-purple-medium rounded-full flex-shrink-0" />
                  <h3 className="text-gray-ultra-dark text-2xl sm:text-3xl md:text-5xl VazirFontRegular">
                    {siteTexts.aboutUs.card1.title}
                  </h3>
                </div>
                <div className="ps-0 lg:ps-3 w-full lg:w-[585px] text-gray-dark text-lg sm:text-xl md:text-[32px] VazirFont leading-normal md:leading-[50px]">
                  <br className="hidden md:block"/>
                  {siteTexts.aboutUs.card1.text}
                </div>
              </div>
            </div>
          </div>
          <div
            className="flex justify-center w-full bg-cover mt-12 md:mt-16 lg:mt-20"
            style={{ backgroundImage: "url(/landing-features-bg.svg)" }} 
          >
            <div className="flex flex-col-reverse lg:flex-row-reverse items-center gap-8 md:gap-20 pt-12 md:pt-[132px] pb-8 md:pb-12">
              <div className="flex-shrink-0">
                <img src="/landing-features-2.svg" alt="ویژگی‌های نرخین - ماموریت ما" className="max-w-xs md:max-w-sm lg:max-w-none"/>
              </div>
              <div className="flex flex-col gap-3 md:gap-5 text-center lg:text-right">
                <div className="flex items-center justify-center lg:justify-start gap-4">
                  <div className="size-4 md:size-6 bg-purple-medium rounded-full flex-shrink-0" />
                  <h3 className="text-gray-ultra-dark text-2xl sm:text-3xl md:text-5xl VazirFontRegular">
                    {siteTexts.aboutUs.card2.title}
                  </h3>
                </div>
                <div className="ps-0 lg:ps-3 w-full lg:w-[585px] text-gray-dark text-lg sm:text-xl md:text-[32px] VazirFont leading-normal md:leading-[50px]">
                  <ul className="list-disc list-inside space-y-3 md:space-y-5 text-left lg:text-right">
                    <br className="hidden md:block"/>
                    {siteTexts.aboutUs.card2.listItems.map((item, index) => (
                      <li key={`mission-item-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="flex flex-col items-center gap-8 pt-16 md:pt-24 px-4 sm:px-8 md:px-16 lg:px-32 relative">
          <div id={ANCHOR_IDS.SERVICES} className="absolute -top-16 md:-top-20"></div>
          <div className="flex flex-col items-center gap-4 md:gap-8">
            <h2 className="text-3xl sm:text-4xl md:text-[64px] VazirFontBold leading-none text-gray-dark text-center">
              {siteTexts.services.sectionTitle}
            </h2>
            <div className="w-24 md:w-[143px] h-4 md:h-6 bg-white-light rounded-[17px]"></div>
          </div>
          <p className="text-lg sm:text-xl md:text-[32px] text-gray-dark text-center mt-4">
            {siteTexts.services.introLines.map((line, index) => (
              <React.Fragment key={`services-intro-${index}`}>
                {line}
                {index < siteTexts.services.introLines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
          <ul className="list-disc list-inside text-gray-800 space-y-3 md:space-y-5 text-base sm:text-lg md:text-2xl mt-8 self-center md:self-start w-full max-w-3xl mx-auto text-right">
            <br className="hidden md:block"/>
            {siteTexts.services.listItems.map((item, index) => (
              <li key={`service-item-${index}`}>{item}</li>
            ))}
          </ul>
        </section>

        {/* Contact Us Section */}
        <section className="flex flex-col gap-8 pt-20 md:pt-32 px-4 sm:px-8 md:px-16 lg:px-32 xl:px-64 relative">
          <div id={ANCHOR_IDS.CONTACT_US} className="absolute -top-16 md:-top-20"></div>
          <div className="flex flex-col items-center gap-4 md:gap-8">
            <h2 className="text-3xl sm:text-4xl md:text-[64px] VazirFontBold leading-none text-gray-800 text-center">
              {siteTexts.contactUs.sectionTitle}
            </h2>
            <div className="w-24 md:w-[143px] h-4 md:h-6 bg-white-light rounded-[17px]"></div>
            <p className="text-lg sm:text-xl md:text-[30px] leading-relaxed md:leading-8 text-center text-gray-600 mt-4">
              {siteTexts.contactUs.intro}
            </p>
            <div className="text-base sm:text-lg md:text-[24px] leading-7 text-center text-gray-700 mt-4">
              <p className="font-medium">{siteTexts.contactUs.phoneLabel}</p>
              <br />
              {siteTexts.contactUs.phoneNumbers.map((number, index) => (
                <React.Fragment key={`phone-${index}`}>
                  <span className="text-blue-600 font-medium">{number}</span>
                  {index < siteTexts.contactUs.phoneNumbers.length - 1 && <br />}
                </React.Fragment>
              ))}
              <br />
              <br />
              <p className="font-medium">{siteTexts.contactUs.emailLabel}</p>
              <a
                href={`mailto:${siteTexts.contactUs.emailValue}`}
                className="text-blue-600 font-medium hover:underline"
              >
                {siteTexts.contactUs.emailLinkText}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-[60px] md:mt-[90px] h-auto py-8 md:h-[124px] bg-blue-ultra-dark text-white text-xl md:text-[32px] text-center flex flex-col justify-center items-center gap-4">
        <a
          referrerPolicy="origin"
          target="_blank"
          href='https://trustseal.enamad.ir/?id=499324&Code=qUFfiNF3M90UB6Sh4ndCWTFtw16hHWBS' // این لینک‌ها و IDها معمولا ثابت یا از تنظیمات می‌آیند
        >
          <img
            width={64} // اندازه را می‌توانید برای موبایل کوچکتر کنید
            height={64}
            src='https://trustseal.enamad.ir/logo.aspx?id=499324&Code=qUFfiNF3M90UB6Sh4ndCWTFtw16hHWBS' 
            alt={siteTexts.footer.enamadAltText}
            style={{ cursor: "pointer" }}
            className="mx-auto"
          />
        </a>
        <SamandehiLogo/>
        <span>{siteTexts.footer.copyright}</span>
      </footer>
   
 </>
  );
}