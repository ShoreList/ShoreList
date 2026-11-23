// Named local places for each "things to do" category page, so every page points at real, checkable spots.
// Every fact below was checked against an official or visitor-bureau page in November 2026:
//   Riverwalk length and ends: wilmingtonnc.gov (Parks and Recreation, Riverwalk)
//   Masonboro Island Reserve: deq.nc.gov (boat access only) and coastallandtrust.org (5,600 acres)
//   Johnnie Mercer's Pier: johnniemercersfishingpier.com (1,200 feet, first concrete pier on the NC coast)
//   The Loop and Wrightsville Beach Park: wrightsvillebeach.com (about 2.5 miles; playground, court, volleyball pits)
//   Kure Beach pier and Ocean Front Park: townofkurebeach.org (visitor information)
//   Fort Fisher State Recreation Area: ncparks.gov (pedestrian beach open year-round, 24 hours; 1000 Loggerhead Road)
//   Carolina Beach State Park trails: ncparks.gov (about 9 miles of trails; Flytrap Trail 0.5-mile loop, hiking only)
//   Carolina Beach Boardwalk, Snow's Cut, Carolina Beach location: carolina-beach.wilmingtonandbeaches.com; marina: carolinabeach.org
//   Greenfield Lake: capefearriverwatch.org (paddle boats, kayaks and canoes)
//   Addresses for Airlie Gardens, the Battleship, Cameron Art Museum, Children's Museum, Burgwin-Wright House: tools/venue-facts.json (each sourced there)
// No prices, hours or rules are given here unless sourced; rules for boats, bikes and carts differ by town and season.
export const PLACES = {
  'ghost-tours': {
    places: [
      ['Wilmington Riverwalk', 'The Riverwalk runs 1.75 miles along the Cape Fear River, from the foot of Nun Street to the Isabel Holmes Bridge. Evening tours stay in the historic district a few blocks away, and the river is the natural place for a walk before or after.'],
      ['Burgwin-Wright House and Gardens', 'This historic house museum stands at 224 Market Street, inside the district where most ghost tours walk. Visit in daylight to see the house itself, then come back after dark for the stories.'],
      ['Battleship North Carolina', 'The World War II battleship sits across the river from downtown at 1 Battleship Road and is open for self-guided tours. It pairs well with a ghost tour as a daytime stop on the same trip.']
    ],
    plan: 'Book the evening tour first, then fill the day around it. Downtown has five city parking decks, so you can park once and walk to the tour meeting point, the river and dinner.'
  },
  'walking-tours': {
    places: [
      ['Wilmington Riverwalk', 'The Riverwalk follows the Cape Fear River for 1.75 miles, from the foot of Nun Street to the Isabel Holmes Bridge. Many walking routes start in the historic district and end at the water.'],
      ['Burgwin-Wright House and Gardens', 'At 224 Market Street, this historic house museum is a good stop to add to a downtown walk when you want to go inside one of the old houses instead of only passing it.'],
      ['Cameron Art Museum', 'Cameron Art Museum is at 3201 South 17th Street, a drive from the historic district. It suits a second half day after you have covered the downtown streets on foot.']
    ],
    plan: 'Walking tours here are easiest in the morning or early evening. Wear comfortable shoes for brick sidewalks, and leave time to sit by the river afterward.'
  },
  museums: {
    places: [
      ['Battleship North Carolina', 'The World War II battleship is moored at 1 Battleship Road and is open for self-guided tours. Plan on a good part of a morning, and check the ticket site for current hours.'],
      ['Cameron Art Museum', 'Cameron Art Museum at 3201 South 17th Street is an art museum and a calm indoor choice when the weather turns.'],
      ['Children\'s Museum of Wilmington', 'The Children\'s Museum is at 116 Orange Street, downtown, and is built for younger kids who need to touch and play.'],
      ['Fort Fisher State Historic Site', 'South of Kure Beach, general admission to the Fort Fisher State Historic Site is free and donations are welcome. It is open Tuesday to Saturday, 9 a.m. to 5 p.m., and closed Sunday, Monday and designated state holidays.']
    ],
    plan: 'Mix one downtown museum with one on the south end of the island and you have two easy days without much driving. Always check each museum\'s own page for hours before you go.'
  },
  'film-tours': {
    places: [
      ['Wilmington Riverwalk', 'The Riverwalk is a public path along the Cape Fear River, 1.75 miles from the foot of Nun Street to the Isabel Holmes Bridge. Its river views show up in plenty of downtown photos.'],
      ['Front Street', 'Front Street is one of downtown\'s main streets, lined with shops and restaurants. It is an easy place to start a self-guided walk between tour stops.'],
      ['Wilmington Railroad Museum', 'The Railroad Museum downtown at 505 Nutt Street has real rail cars and model trains, a good indoor break for families who have been walking location to location.']
    ],
    plan: 'Pick a morning for the walking part, since downtown gets busy at lunch. A guided tour saves time hunting for each spot, and you can add the Riverwalk on your own.'
  },
  'fishing-charters': {
    places: [
      ['Carolina Beach Marina and Mooring Field', 'The town of Carolina Beach lists a marina and mooring field among its beaches and waterways. Many half and full day trips begin from marinas like this one, so confirm the dock with your captain.'],
      ['Johnnie Mercer\'s Pier', 'On the Wrightsville Beach strand, this pier reaches 1,200 feet over the Atlantic and was the first concrete pier on the North Carolina coast. It is a good place to watch how the fish are running before you book.'],
      ['Kure Beach Fishing Pier', 'The town of Kure Beach calls its pier the oldest fishing pier on the East Coast. You can walk on it for free, and it sits next to Ocean Front Park at 105 Atlantic Avenue.']
    ],
    plan: 'If you are new to fishing, walk a pier first for a feel for the water, then book a short inshore trip. Bring sun protection and ask what bait and tackle the boat provides.'
  },
  'kayak-tours': {
    places: [
      ['Masonboro Island Reserve', 'Masonboro Island is a 5,600 acre undeveloped barrier island south of Wrightsville Beach. It can only be reached by boat, with public and private ramps near Wrightsville Beach and Carolina Beach, so a guided kayak trip is a simple way to see it.'],
      ['Snow\'s Cut', 'Snow\'s Cut is the channel that links the Cape Fear River to the waterway behind Carolina Beach. The Wilmington and Beaches visitors bureau lists it as a scenic spot for kayaking, paddleboarding and birdwatching.'],
      ['Greenfield Lake', 'Greenfield Lake is a freshwater lake in the middle of Wilmington, ringed by cypress trees. Kayaks, canoes and paddle boats are available to rent there through Cape Fear River Watch, so it works for a calm first paddle.']
    ],
    plan: 'Tides and wind matter on the salt marsh, so book a morning slot when you can and let the guide pick the route. Bring water, sunscreen and a bag that can get wet.'
  },
  'river-cruises': {
    places: [
      ['Wilmington Riverwalk', 'You can watch the river from the Riverwalk, which runs 1.75 miles along the Cape Fear River from the foot of Nun Street to the Isabel Holmes Bridge. It is a good place to see what is on the water before you board.'],
      ['Battleship North Carolina', 'The battleship is moored across the river from downtown at 1 Battleship Road. It is one of the first things you see from the water.'],
      ['Isabel Holmes Bridge', 'The bridge marks the north end of the Riverwalk. It is a good landmark for orienting yourself on the Cape Fear River, and its view up and down the river is worth a pause.']
    ],
    plan: 'A cruise fits well in the late afternoon, with a walk on the Riverwalk before it and dinner downtown after. Check the tide and weather page the morning of your trip.'
  },
  'surf-lessons': {
    places: [
      ['Johnnie Mercer\'s Pier', 'The pier reaches 1,200 feet over the Atlantic at Wrightsville Beach and was the first concrete pier on the North Carolina coast. It is an easy landmark for finding your spot on the sand and checking the waves.'],
      ['Wrightsville Beach Park', 'The park sits along the Loop and has a playground, an outdoor basketball court and three volleyball pits. It is handy for a break between lesson and lunch, especially with younger kids waiting on the sand.'],
      ['Ocean Front Park and Pavilion', 'Ocean Front Park at 105 Atlantic Avenue in Kure Beach has benches and swings along the boardwalk. It is a quieter spot for friends and family who would rather watch the lesson than join it.']
    ],
    plan: 'Check the live surf report on the weather page the day before and again that morning. Waves are usually friendliest for first timers on smaller days, and your instructor will say which beach access to use.'
  },
  paddleboard: {
    places: [
      ['Banks Channel', 'Banks Channel runs along the sound side of Wrightsville Beach, and the Loop crosses it by bridge. The sound side is usually calmer than the ocean, which makes it a common place to learn.'],
      ['Masonboro Island Reserve', 'Masonboro Island is a 5,600 acre undeveloped barrier island reachable only by boat, with ramps near Wrightsville Beach and Carolina Beach. Experienced paddlers cross to it, and guided trips can show you the way.'],
      ['Snow\'s Cut', 'The visitors bureau lists Snow\'s Cut at Carolina Beach as a scenic spot for kayaking, paddleboarding and birdwatching. Current and wind can be strong in the cut, so ask a guide about timing.']
    ],
    plan: 'Early morning is usually the calmest time on the water. Wear a leash and a life jacket, and tell someone where you are going if you head out without a guide.'
  },
  'bike-tours': {
    places: [
      ['The Loop at Wrightsville Beach', 'The Loop is a roughly 2.5 mile path around the heart of Wrightsville Beach. It crosses Banks Channel and passes Wrightsville Beach Park, so it makes an easy flat ride with places to stop.'],
      ['Greenfield Lake', 'A paved loop circles Greenfield Lake in the middle of Wilmington, past cypress trees and the park\'s gardens. It is a good fit for an easy ride with children.'],
      ['Carolina Beach State Park', 'The park, 12 miles south of Wilmington, has nearly 9 miles of trails, and bicyclists share some of them with hikers and are asked to yield. Check the park\'s trail list for which trails allow bikes.']
    ],
    plan: 'Bring water and ride early in summer. A guided tour can pick a route that matches your group, and it handles the parking and the turns.'
  },
  'wildlife-tours': {
    places: [
      ['Masonboro Island Reserve', 'This 5,600 acre undeveloped barrier island south of Wrightsville Beach can only be reached by boat. Its marsh, dunes and shoreline are undeveloped habitat for coastal birds and wildlife.'],
      ['Carolina Beach State Park', 'The park is 12 miles south of Wilmington and is home to wild Venus flytraps. The Flytrap Trail is a half mile, wheelchair accessible loop where the plants grow along the edges of the wetlands. Stay on the trail to protect them.'],
      ['Fort Fisher State Recreation Area', 'The recreation area at 1000 Loggerhead Road in Kure Beach has a pedestrian beach that is open year-round, 24 hours a day. It is a quiet place to walk and watch shorebirds.']
    ],
    plan: 'Dawn and dusk are the best hours for watching animals. Bring binoculars, bug spray and a hat, and keep a respectful distance from nesting birds.'
  },
  'ebike-rentals': {
    places: [
      ['The Loop at Wrightsville Beach', 'The Loop is a roughly 2.5 mile path around the heart of Wrightsville Beach, over Banks Channel and past Wrightsville Beach Park. It is flat, shaded in places and easy to ride at a relaxed pace.'],
      ['Greenfield Lake', 'The paved loop around Greenfield Lake in Wilmington runs past cypress trees and the park\'s gardens. It is a good place to learn how an e-bike handles before heading farther.'],
      ['Airlie Gardens', 'Airlie Gardens is at 300 Airlie Road in Wilmington. Rules for bikes inside the gardens can differ from the public roads outside, so check at the gate before you ride in.']
    ],
    plan: 'Ask the rental shop about helmets, locks and whether you can take the bike across a bridge. Rules for bikes differ by town, so confirm them before you ride.'
  },
  'scooter-rentals': {
    places: [
      ['Carolina Beach Boardwalk', 'The boardwalk at Carolina Beach has rides, food and events in season. Carolina Beach is about 15 miles south of Wilmington at the northern end of Pleasure Island.'],
      ['Kure Beach Fishing Pier and Ocean Front Park', 'The town of Kure Beach calls its pier the oldest fishing pier on the East Coast. It is free to walk on and sits next to Ocean Front Park, where swings and benches line the boardwalk.'],
      ['Carolina Beach Lake Park', 'The park on Atlanta Avenue has an 11 acre lake, four gazebos, a playground and a picnic area. It is a good place to park the scooter and take a short walk.']
    ],
    plan: 'Rules for scooters differ by town, so ask the rental shop where you can ride and where you cannot. Wear a helmet and keep to the road, not the boardwalk.'
  },
  'fat-bike-rentals': {
    places: [
      ['Carolina Beach State Park', 'Nearly 9 miles of trails run through the park, 12 miles south of Wilmington. Bicyclists share some trails with hikers and are asked to yield, so check the trail list for bike access.'],
      ['Fort Fisher State Recreation Area', 'The recreation area at 1000 Loggerhead Road in Kure Beach has a pedestrian beach that is open year-round, 24 hours a day. Ask the rental shop about rules for bikes near the beach.'],
      ['Ocean Front Park and Pavilion', 'Ocean Front Park at 105 Atlantic Avenue in Kure Beach has benches and swings along the boardwalk. It is a pleasant place to end a ride and cool off.']
    ],
    plan: 'Fat tires roll over soft sand and loose surfaces, but beach rules for bikes differ by town and by season. Confirm where you can ride with the shop and the town before you go.'
  },
  'sailboat-rides': {
    places: [
      ['Banks Channel', 'Banks Channel runs along the sound side of Wrightsville Beach, and the Loop crosses it by bridge. It is more sheltered than the open ocean, which suits a relaxed sail.'],
      ['Carolina Beach Marina and Mooring Field', 'The town of Carolina Beach lists a marina and mooring field among its beaches and waterways. Many boat trips begin at marinas like this one, so confirm the dock with your captain.'],
      ['Masonboro Island Reserve', 'Masonboro Island is a 5,600 acre undeveloped barrier island reachable only by boat. Its shoreline is a pleasant backdrop to see from the water on a calm day.']
    ],
    plan: 'Sunset sails fill early on summer weekends, so plan ahead. Bring a layer, since it cools down once the sun sets over the water.'
  },
  'nature-walks': {
    places: [
      ['Carolina Beach State Park', 'The park is 12 miles south of Wilmington and is home to wild Venus flytraps. The Flytrap Trail is a half mile, hiking only loop that is wheelchair accessible, and the plants grow along the edges of the wetlands. Stay on the trail.'],
      ['Airlie Gardens', 'Airlie Gardens is a public garden at 300 Airlie Road in Wilmington. It is a calm place to walk among old trees and plantings, and its azaleas typically bloom from mid-March to mid-April.'],
      ['Greenfield Lake', 'A paved loop circles Greenfield Lake in Wilmington, past cypress trees. It is an easy walk for kids and grandparents who want shade and water.']
    ],
    plan: 'Wear closed shoes, bring bug spray and water, and start early in summer. Check each park\'s own page for current hours before you go.'
  },
  'beach-photography': {
    places: [
      ['Johnnie Mercer\'s Pier', 'The pier reaches 1,200 feet over the Atlantic at Wrightsville Beach and was the first concrete pier on the North Carolina coast. Its long lines are a favorite frame for portraits at sunrise.'],
      ['Kure Beach Fishing Pier and Ocean Front Park', 'The town of Kure Beach calls its pier the oldest fishing pier on the East Coast. The pier is free to walk on and sits next to Ocean Front Park at 105 Atlantic Avenue, with swings and benches.'],
      ['Airlie Gardens', 'Airlie Gardens at 300 Airlie Road in Wilmington is a public garden with old trees and plantings. It suits a family portrait away from the sand, and its azaleas typically bloom from mid-March to mid-April.']
    ],
    plan: 'Golden hour, just after sunrise or before sunset, gives the softest light. Choose your outfit colors with the sand and sky in mind, and ask your photographer about permits for any location.'
  },
  'beach-picnics': {
    places: [
      ['Carolina Beach Lake Park', 'The park on Atlanta Avenue has an 11 acre lake, four gazebos, a playground and a picnic area. It is a calm option for a picnic with small children.'],
      ['Wrightsville Beach Park', 'The park sits along the Loop and has a playground, an outdoor basketball court and three volleyball pits, with benches where parents can keep an eye on the action.'],
      ['Ocean Front Park and Pavilion', 'Ocean Front Park at 105 Atlantic Avenue in Kure Beach has swings and benches along the boardwalk, next to the town fishing pier.']
    ],
    plan: 'Check the weather page for wind before you pick a spot, and bring a tablecloth weight. Parking is paid in season at the beaches, so arrive early and read the signs.'
  },
  'beach-chairs': {
    places: [
      ['Wrightsville Beach strand', 'The beach near Johnnie Mercer\'s Pier is one of the most recognizable stretches on Wrightsville Beach. The pier reaches 1,200 feet over the Atlantic, so it makes an easy landmark for setting up your chairs.'],
      ['Kure Beach Ocean Front Park', 'Ocean Front Park at 105 Atlantic Avenue, next to the town fishing pier, puts you in the middle of the Kure Beach business district. Benches and swings line the boardwalk behind your spot.'],
      ['Carolina Beach Boardwalk', 'The boardwalk at Carolina Beach has rides, food and events in season, so it is an easy walk from your chairs to lunch.']
    ],
    plan: 'Paid beach parking runs from March 1 to October 31 at Carolina Beach and Wrightsville Beach (2026 dates), so arrive early and read the signs. Ask the rental company where it sets up on each beach.'
  },
  'jet-ski-rentals': {
    places: [
      ['Carolina Beach Marina and Mooring Field', 'The town of Carolina Beach lists a marina and mooring field among its beaches and waterways. Many water rentals launch from marinas like this one, so confirm the meeting point when you book.'],
      ['Snow\'s Cut', 'Snow\'s Cut is the channel that links the Cape Fear River to the waterway behind Carolina Beach. The visitors bureau lists it as a scenic spot for kayaking and birdwatching, so expect other boats and paddlers.'],
      ['Masonboro Island Reserve', 'Masonboro Island is a 5,600 acre undeveloped barrier island reachable only by boat. It is a protected reserve, so ask the rental company about any limits on where you can ride near it.']
    ],
    plan: 'Rules for personal watercraft differ by waterway, so ask about age limits, speed zones and safety gear. Plan on a morning ride, before the wind picks up.'
  },
  'golf-cart-rentals': {
    places: [
      ['Carolina Beach Boardwalk', 'The boardwalk at Carolina Beach has rides, food and events in season. Carolina Beach is about 15 miles south of Wilmington at the northern end of Pleasure Island.'],
      ['Kure Beach Fishing Pier and Ocean Front Park', 'The town of Kure Beach calls its pier the oldest fishing pier on the East Coast. It is free to walk on and sits next to Ocean Front Park at 105 Atlantic Avenue.'],
      ['Carolina Beach Lake Park', 'The park on Atlanta Avenue has an 11 acre lake, four gazebos, a playground and a picnic area, a pleasant stop with kids in the back seat.']
    ],
    plan: 'Rules for golf carts differ by town, so ask the rental company where you may drive and where you must park. Bring a license and plan on parking where the signs allow.'
  },
  wellness: {
    places: [
      ['Airlie Gardens', 'Airlie Gardens at 300 Airlie Road in Wilmington is a public garden with old trees and plantings. A slow walk here makes a gentle start before a class or a massage.'],
      ['Greenfield Lake', 'A paved loop circles Greenfield Lake in the middle of Wilmington, past cypress trees. It is a quiet place for a walk or a few minutes of stretching.'],
      ['Carolina Beach State Park', 'The park, 12 miles south of Wilmington, has nearly 9 miles of trails. The half mile Flytrap Trail is an easy, wheelchair accessible loop through wetlands and longleaf pine.']
    ],
    plan: 'Many sessions run outdoors, so check the weather page and bring water. Ask your instructor about mats, what to wear and whether the class meets on sand.'
  }
};
