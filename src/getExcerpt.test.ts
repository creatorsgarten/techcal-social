import { expect, test } from "vitest";
import { getExcerpt } from "./getExcerpt";

const fixtures: Record<string, [string, string | undefined]> = {
  a: [
    "🚀 ขอเชิญร่วมงาน AWS Cloud Day Thailand (8 ส.ค. 2566 ณ ศูนย์ประชุมแห่งชาติสิริกิต์) 🚀\n\nเรียนเชิญทุกท่านที่สนใจเข้าร่วมงานใหญ่ประจำปี “AWS Cloud Day Thailand” ไม่ว่าคุณจะเป็นสาย Business หรือ Tech จะเป็น Startup หรือไปจนถึง Enterprise\n\nมาร่วมอัปเดทความความรู้และ Trend ใหม่ ๆ ด้าน Cloud รวมถึงโอกาสใหม่ทางธุรกิจ พร้อมกับ Sessions หลากหลายในการประยุกต์ใช้งาน เช่น AI/ML, Data Analytics, Containers, Serverless รวมทั้งหัวข้อและกิจกรรมอย่างอื่นอีกมากมาย\n\nผู้ที่สนใจสามารถตรวจสอบรายละเอียด กำหนดการ และลงทะเบียนเพื่อเข้าร่วมงาน (ไม่มีค่าใช้จ่าย) ได้ที่ https://go.aws/3NCypTd\n",
    "🚀 ขอเชิญร่วมงาน AWS Cloud Day Thailand (8 ส.ค. 2566 ณ ศูนย์ประชุมแห่งชาติสิริกิต์) 🚀",
  ],
  b: [
    "🔥 Update: งาน Google I/O Extended Cloud Bangkok จะจัดร่วมกับ GDG Bangkok วันที่ 19 สิงหาคม 2566\n\nGoogle I/O Extended Cloud Bangkok 2023 คือ งานที่จัดโดย GDG Cloud Bangkok community เพื่ออัปเดตเทคโนโลยีใหม่ล่าสุด จากงาน Google I/O ซึ่งจัดเป็นประจำในทุกปี\n\nในงานนี้จะโฟกัสที่ technology Google Cloud Platform (GCP), AI/ML และการเปิดตัวครั้งสำคัญของ Generative AI\n\n🔥 Update: งาน Google I/O Extended Cloud Bangkok จะจัดร่วมกับ GDG Bangkok วันที่ 19 สิงหาคม 2566\n📅 วันที่: 19 สิงหาคม 2566 เวลา 11.00 - 20.00 น.\n📍 สถานที่: Siam Paragon\n\nรอติดตามรายละเอียดงานได้ เร็ว ๆ นี้\n\nhttps://gdg.community.dev/events/details/google-gdg-cloud-bangkok-presents-google-io-extended-cloud-bangkok-2023\n",
    "🔥 Update: งาน Google I/O Extended Cloud Bangkok จะจัดร่วมกับ GDG Bangkok วันที่ 19 สิงหาคม 2566",
  ],
  c: [
    '<p><strong>Title:</strong> GraphQL Bangkok 11.0 Meetup<br><strong>Date and time:</strong> 31st July 2023, 6.00 PM<br><strong>Venue:</strong> True Digital Park (East) - 7th floor - Townhall S - (In-person event)<br><strong>RSVP required:</strong> RSVP on <a href="https://www.meetup.com/GraphQL-Bangkok/">Meetup.com</a> required - limited seats<br><strong>Price:</strong> Free to attend, Food &amp; Drinks provided<br><strong>Sponsors:</strong> <a href="https://www.hubql.com/">Hubql</a></p><p><strong>Agenda:</strong><br><strong>06.00 - 06:30 PM:</strong> Registration/Food - get your access at Pegasus building lobby with a sticker to skip ID check.<br><strong>06:30 - 06:45 PM:</strong> Welcome Word: Tobias Meixner</p><p><strong>Talks:</strong><br><strong>06:45 - 07:15 PM:</strong> Talk 1 - <strong>GraphQL vs TRPC vs REST: Kongkeit Khunpanitchot</strong><br><strong>Description:</strong><br>Comparing GraphQL to other solutions and when to use either to guide when is GraphQL the right tool for the job.</p><p><strong>07:15 - 07:45 PM:</strong> Talk 2 - <strong>GraphQL Observability: Dan Starns</strong><br><strong>Description:</strong><br>So you spent all this time building and deploying your GraphQL API but your users are reporting slow queries and crashes. Before you can pinpoint those issues you first need to know how many requests you are getting, what each query was, and what’s going on in your resolvers. Join Dan where you will learn what observability is, how you can install it onto your GraphQL API, and how you can use it to improve your user\'s experience.</p><p><strong>07:45 - 08:15 PM:</strong> Talk 3 or Lightning Talks - Submit your talk in our CFP or reach out to us during the event:<br><a href="https://forms.gle/ogc79FTTzTb4ypcz8">https://forms.gle/ogc79FTTzTb4ypcz8</a></p><p><strong>08:15 -</strong> Networking &amp; After party at your own expense @ <a href="https://goo.gl/maps/KMhc3zq5SgkuvG9s5">Hunters Garden</a></p>',
    "Title: GraphQL Bangkok 11.0 Meetup",
  ],
  d: [
    '<div dir="auto">📣สมาคมโปรแกรมเมอร์ไทย ร่วมกับ LSEG, <a href="https://www.facebook.com/krungsrinimble?__cft__[0]=AZXL7RKdvbK2hbW2I0kHV1DcBeoC3xobyeFv5zO8I_NfIbStNYpYwSawBBTXxOVTcZUSmA89ZJhDp8ocCZSIS1iOiQw2u9mKNBJdmXVA5fn8rFSDjrrA5BAN8aiYyaow_JDBOBdxwZCVSAAkoeT99Z8m&amp;__tn__=-]K-R">Krungsri Nimble</a> และ <a href="https://www.facebook.com/profile.php?id=100063551352462&amp;__cft__[0]=AZXL7RKdvbK2hbW2I0kHV1DcBeoC3xobyeFv5zO8I_NfIbStNYpYwSawBBTXxOVTcZUSmA89ZJhDp8ocCZSIS1iOiQw2u9mKNBJdmXVA5fn8rFSDjrrA5BAN8aiYyaow_JDBOBdxwZCVSAAkoeT99Z8m&amp;__tn__=-]K-R">Doppio TECH</a> จัดกิจกรรม meetup <div dir="auto">.<div dir="auto">QA Meetup<div dir="auto">.<div dir="auto">📍มาร่วมพูดคุยและแลกเปลี่ยนความรู้ พร้อมกับเรียนรู้เทคนิคที่ทันสมัยและก้าวหน้าในการทำ QA ในยุคที่เทคโนโลยีเปลี่ยนแปลงอย่างรวดเร็ว<br><a href="https://www.eventpop.me/e/15796">https://www.eventpop.me/e/15796</a>',
    "📣สมาคมโปรแกรมเมอร์ไทย ร่วมกับ LSEG, Krungsri Nimble และ Doppio TECH จัดกิจกรรม meetup",
  ],
  e: ["https://creatorsgarten.org/event/cssmeetup0823", undefined],
};

for (const [key, [input, expected]] of Object.entries(fixtures)) {
  test(key, () => {
    const actual = getExcerpt(input);
    expect(actual).toBe(expected);
  });
}
