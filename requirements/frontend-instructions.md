# Build a web app that provides leaderboards for the top 100 movies, tv shows, music, and books in the past 1w/1m/1y/all time.

You are an expert in TypeScript, Next.js App Router, React, and Tailwind. Follow @Next.js docs for Data Fetching, Rendering, and Routing. 

Your job is to create a web application with the following features:
- User authentication using Firebase Auth
- Tab navigation to different routes: Home and Profile
- the leaderboards will be displayed on the home page, and the user can filter between main categories like movies, tv shows, music, and books. they can choose to see the top 10/25/50/100 in the past 1w/1m/1y/all time. they can then filter by minor categories like genre, year, and rating. there is also a search bar for users to search for a specific content.

- use AI and web scrapingto get the top 100 subjects for each category automatically.
- these metrics will automatically update every 7 days.

- The Visual content scores come from platforms like IMDB, OMDB, TMDB, Rotten Tomatoes, and Metacritic or Top Film Critics, or any other platform that provides relevant information.
- The Audio content scores come from platforms like Billboard, Metabrainz, Rolling Stone, Apple Music, Spotify, and Metacritic or Top Music Critics.

- Each item on the leaderboard will show a small image, it's ranking in the leaderboard, the title. then a row that shows the average rating across all platforms that we can find data for, the release date, the runtime/length/duration (depending on the category), and the mpa-rating (or equivalent, if applicable). the next row will be populated with genre tags. the next row will show a brief description of the content. the next row will show the bookmark, like, add to lists, comments, where to consume, watch, listen to said content, how to get tickets for said content if applicable, and a share button. the share button will open up the device’s default share dialog. you can also see the subjects user rating in the form of 10 blank stars and if that user has rated said subject, those stars will be filled in.
- Each item has its own dedicated page with all of it's rankings on various other platforms, a similar content section, and also a list of places where the subject’s content can be consumed, watched, listened to, streamed, or purchased. Each subject will have the following action buttons; like, bookmark, add to lists, where to consume, watch, listen to said content, how to get tickets for said content if applicable, and a share button. The share button will open up the device’s default share dialog. You can also see the subjects user rating and if that user has rated said subject.

- Highratings.com will be built for the purpose of generating ad revenue through all of the many pages that we hope users can navigate through. Build it in such a way that has placeholder images where ads can be placed. Optimize the page for this goal. I also want the page to be very simple and easy to navigate. Minimalist. It’s to get information to the users as fast as possible while encouraging them to visit other pages and spend as much time clicking on things on the site.

- Allows users to sign up for their own highratings.com account where they can leave scores from 0-10 stars. Each user has their own dashboard with their likes, bookmarks, ratings, and lists.
- The User Dashboard allows one to create an account where they can like, bookmark, add to lists, and rate content on the site. They can also share things like their lists.

Use the existing Firebase configuration and utility functions from the codebase. Implement the social media functionality in new page components for the feed, profile, and post creation. Create any necessary components for the user interface and post interactions. Replace any existing code in the codebase to transform it into a social media application.

