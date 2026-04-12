import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Trophy,
  Medal,
  Star,
} from "lucide-react";

export default function Rewards() {
  const navigate = useNavigate();
  const [points, setPoints] = useState(340);

  const [rewards, setRewards] = useState([
    { title: "Coffee Coupon", cost: 200, icon: "☕", redeemed: false },
    { title: "Movie Voucher", cost: 500, icon: "🎬", redeemed: false },
    { title: "Campus Badge", cost: 300, icon: "🏅", redeemed: false },
    { title: "Shopping Gift Card", cost: 800, icon: "🛍️", redeemed: false },
  ]);

  const redeemReward = (index) => {
    const item = rewards[index];
    if (item.redeemed) return;

    if (points >= item.cost) {
      const updated = [...rewards];
      updated[index].redeemed = true;
      setRewards(updated);
      setPoints(points - item.cost);
      alert(`${item.title} Redeemed Successfully 🎉`);
    } else {
      alert("Not enough points ❌");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 p-6 text-white">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/user")}
          className="flex items-center gap-2 text-slate-300 hover:text-violet-200 mb-4 transition"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Points & Rewards</h1>
              <p className="text-slate-300 mt-1">
                Earn points by helping your city and redeem rewards.
              </p>
            </div>

            <div className="bg-white/10 border border-white/10 px-6 py-4 rounded-2xl text-center">
              <p className="text-sm text-violet-200">Your Balance</p>
              <h2 className="text-3xl font-bold">{points}</h2>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <div className="bg-amber-500/20 border border-white/10 rounded-2xl p-5">
              <Trophy className="text-amber-200" />
              <p className="text-sm mt-2 text-amber-200">Total Badges</p>
              <h2 className="text-3xl font-bold">5</h2>
            </div>

            <div className="bg-fuchsia-500/20 border border-white/10 rounded-2xl p-5">
              <Medal className="text-fuchsia-200" />
              <p className="text-sm mt-2 text-fuchsia-200">Current Rank</p>
              <h2 className="text-3xl font-bold">Level 3</h2>
            </div>

            <div className="bg-emerald-500/20 border border-white/10 rounded-2xl p-5">
              <Star className="text-emerald-200" />
              <p className="text-sm mt-2 text-emerald-200">Redeemed</p>
              <h2 className="text-3xl font-bold">
                {rewards.filter((r) => r.redeemed).length}
              </h2>
            </div>
          </div>

          {/* Rewards */}
          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {rewards.map((item, i) => {
              const unlocked = points >= item.cost;

              return (
                <div
                  key={i}
                  className="bg-white/10 rounded-2xl border border-white/10 p-5 hover:bg-white/15 transition"
                >
                  <div className="text-4xl">{item.icon}</div>

                  <h3 className="font-semibold mt-4">{item.title}</h3>

                  <p className="text-sm text-slate-300 mt-1">
                    {item.cost} Points
                  </p>

                  <button
                    onClick={() => redeemReward(i)}
                    disabled={!unlocked || item.redeemed}
                    className={`mt-4 w-full py-2 rounded-xl text-sm font-medium transition ${
                      item.redeemed
                        ? "bg-emerald-500 text-white"
                        : unlocked
                        ? "bg-gradient-to-r from-violet-500 to-indigo-500 text-white"
                        : "bg-white/10 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {item.redeemed
                      ? "Redeemed"
                      : unlocked
                      ? "Redeem"
                      : "Locked"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Progress */}
          <div className="mt-10 bg-gradient-to-r from-violet-500/30 to-indigo-500/30 border border-white/10 rounded-3xl p-6">
            <h3 className="text-xl font-semibold">
              Keep Reporting & Earn More!
            </h3>

            <p className="text-sm mt-2 text-slate-300">
              You need only {500 - points > 0 ? 500 - points : 0} more points
              to reach Level 4.
            </p>

            <div className="w-full h-2 bg-white/10 rounded-full mt-4 overflow-hidden">
              <div
                className="h-full bg-white rounded-full"
                style={{ width: `${Math.min((points / 500) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}