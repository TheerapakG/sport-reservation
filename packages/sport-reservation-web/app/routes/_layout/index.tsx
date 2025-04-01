import { createFileRoute } from "@tanstack/react-router";

function IndexComponent() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 p-0">
      {/* Hero Section */}
      <div className="flex items-center bg-[#E1F8FF]">
        <section className="mx-auto w-3/5 max-w-7xl py-8 pr-4 pl-30 text-left">
          <h1 className="mu-2 mb-1 text-3xl/[1.5] font-extrabold text-[#514747]">
            Spark &mdash; Where Sports Bring People Together, Friendships Are
            Built, and Fun Never Ends.
          </h1>
          <p className="mb-4 max-w-3xl text-lg text-[#514747] md:text-xl">
            Join sports events, match with players of your skill level, and make
            every game memorable. Whether you're a beginner or a pro, there's a
            spot for you!
          </p>
          <button className="h-[40] w-[180] rounded-lg bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0]">
            <p className="px-4 py-2 font-medium text-white">Spark the fun!</p>
          </button>
        </section>
        <section className="flex h-48 w-2/5 items-center justify-center">
          <img
            src="app/components/Assets/Element/LandingPageIcon.png"
            alt="Component"
            className="h-auto w-4/9 p-4"
          />
        </section>
      </div>

      {/* How It Works (Replaced with an image) */}
      <section className="w-full">
        <img
          src="app/components/Assets/Image/HowItWorks.png"
          alt="How It Works"
          className="w-full"
        />
      </section>

      {/* Hear From Our Players - Horizontal Scroll */}
      <section className="mx-auto w-full flex-col px-4 py-8">
        <div className="flex justify-center">
          <h2 className="mb-6 pr-2 text-center text-2xl font-bold text-[#514747] md:text-3xl">
            Hear From
          </h2>
          <h2 className="mb-6 text-center text-2xl font-bold text-[#F28382] md:text-3xl">
            Our Players
          </h2>
        </div>

        <div className="overflow-x-auto px-4 pb-4">
          <div className="flex space-x-4">
            <div className="min-w-[300px] rounded-lg bg-[rgba(202,242,255,0.42)] p-4 shadow-lg">
              <div className="flex h-16 flex-col justify-center pb-2">
                <p className="text-center font-semibold md:text-xl">
                  “Easy to Join & Play”
                </p>
              </div>
              <p>
                "The event feature makes it so easy to find games that fit my
                schedule. No more last-minute cancellations—just show up and
                play!"
              </p>
              <p className="font-semibold text-[#000000]">- Sarah Lee</p>
            </div>
            <div className="min-w-[300px] rounded-lg bg-[rgba(202,242,255,0.42)] p-4 shadow-lg">
              <p className="h-16 pb-2 text-center font-semibold md:text-xl">
                “Great for Skill-Based Matching!”
              </p>
              <p>
                "I’m a beginner at tennis, and finding someone at my level was
                tough. With Spark’s matching, I got paired with a player who
                helped me improve, and now we train together!"
              </p>
              <p className="font-semibold text-[#000000]">- James M.</p>
            </div>
            <div className="min-w-[300px] rounded-lg bg-[rgba(202,242,255,0.42)] p-4 shadow-lg">
              <div className="flex h-16 flex-col justify-center pb-2">
                <p className="text-center font-semibold md:text-xl">
                  “Built My Own Sports Club!”
                </p>
              </div>
              <p>
                "I wanted a consistent group to play with, so I created my own
                club on Spark. Now, we have weekly matches, and our club keeps
                growing!"
              </p>
              <p className="font-semibold text-[#000000]">- Victoria K.</p>
            </div>
            <div className="min-w-[300px] rounded-lg bg-[rgba(202,242,255,0.42)] p-4 shadow-lg">
              <div className="flex h-16 flex-col justify-center pb-2">
                <p className="text-center font-semibold md:text-xl">
                  “Easy to Join & Play”
                </p>
              </div>
              <p>
                "The event feature makes it so easy to find games that fit my
                schedule. No more last-minute cancellations—just show up and
                play!"
              </p>
              <p className="font-semibold text-[#000000]">- Sarah Lee</p>
            </div>
            <div className="min-w-[300px] rounded-lg bg-[rgba(202,242,255,0.42)] p-4 shadow-lg">
              <div className="flex h-16 flex-col justify-center pb-2">
                <p className="text-center font-semibold md:text-xl">
                  “Easy to Join & Play”
                </p>
              </div>
              <p>
                "The event feature makes it so easy to find games that fit my
                schedule. No more last-minute cancellations—just show up and
                play!"
              </p>
              <p className="font-semibold text-[#000000]">- Sarah Lee</p>
            </div>
            <div className="min-w-[300px] rounded-lg bg-[rgba(202,242,255,0.42)] p-4 shadow-lg">
              <div className="flex h-16 flex-col justify-center pb-2">
                <p className="text-center font-semibold md:text-xl">
                  “Easy to Join & Play”
                </p>
              </div>
              <p>
                "The event feature makes it so easy to find games that fit my
                schedule. No more last-minute cancellations—just show up and
                play!"
              </p>
              <p className="font-semibold text-[#000000]">- Sarah Lee</p>
            </div>
          </div>
        </div>
      </section>

      {/* Spark Plus*/}
      <section className="w-full">
        <div className="bg-[rgba(202,242,255,0.42)] px-4 py-12 md:px-8 lg:px-16">
          {/* Heading */}
          <h2 className="text-center text-2xl font-extrabold text-gray-900 md:text-3xl">
            Unlock <span className="text-black">our exclusive perks</span> with
            <span className="bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] bg-clip-text text-transparent">
              {" "}
              Spark Plus+
            </span>
          </h2>

          {/* Perks Grid */}
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Perk Item */}
            <div className="flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-lg">
              <img
                src="app/components/Assets/Element/LP_FilterIcon.png"
                alt="Filter Icon"
                className="mb-2 h-12 w-12"
              />
              <h3 className="text-lg font-bold text-[#65D1F8]">
                Advanced filters
              </h3>
              <p className="text-sm text-gray-700">
                Refine your matches with precise filters, including skill level,
                availability, and preferences.
              </p>
            </div>

            <div className="flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-lg">
              <img
                src="app/components/Assets/Element/LPMatchingIcon.png"
                alt="Matching Icon"
                className="mb-2 h-12 w-12"
              />
              <h3 className="text-lg font-bold text-blue-600">
                More matching opportunities
              </h3>
              <p className="text-sm text-gray-700">
                Increase your daily match limit and find the best partners for
                your favorite sports.
              </p>
            </div>

            <div className="flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-lg">
              <img
                src="app/components/Assets/Element/LPPriorityIcon.png"
                alt="Event Icon"
                className="mb-2 h-12 w-12"
              />
              <h3 className="text-lg font-bold text-green-600">
                Priority Event Access
              </h3>
              <p className="text-sm text-gray-700">
                Get priority access to limited-seat sports events and exclusive
                tournaments.
              </p>
            </div>

            <div className="flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-lg">
              <img
                src="app/components/Assets/Element/LPExclusiveIcon.png"
                alt="Club Icon"
                className="mb-2 h-12 w-12"
              />
              <h3 className="text-lg font-bold text-purple-600">
                Exclusive Club & Events
              </h3>
              <p className="text-sm text-gray-700">
                Join private Spark Plus+ clubs and members-only sporting events.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white py-4 shadow">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Spark. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export const Route = createFileRoute("/_layout/")({
  component: IndexComponent,
});
