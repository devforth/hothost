import Parser from 'rss-parser'
(async () => {

    let feed = await parser.parseURL('https://www.upwork.com/ab/feed/topics/rss?securityToken=4f6c8acefb934c477bdfa5a8631298cd7edc68d5add16660adbb988bac53486d01f8314d32df565837281903a28365fe7e24e2d654f6b06d0f3bff847a51dabb&userUid=772823940903809024&orgUid=772823977668694017&topic=4595391');
    console.log(feed);
  
   
  
  })();
  let parser = new Parser();