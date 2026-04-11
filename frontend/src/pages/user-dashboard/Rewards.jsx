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
    {
      title: "Coffee Coupon",
      cost: 200,
      icon: "☕",
      redeemed: false,
    },
    {
      title: "Movie Voucher",
      cost: 500,
      icon: "🎬",
      redeemed: false,
    },
    {
      title: "Campus Badge",
      cost: 300,
      icon: "🏅",
      redeemed: false,
    },
    {
      title: "Shopping Gift Card",
      cost: 800,
      icon: "🛍️",
      redeemed: false,
    },
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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/user")}
          className="flex items-center gap-2 text-slate-700 hover:text-indigo-600 mb-4"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Points & Rewards
              </h1>
              <p className="text-slate-500 mt-1">
                Earn points by helping your city and redeem rewards.
              </p>
            </div>

            <div className="bg-indigo-50 px-6 py-4 rounded-2xl text-center">
              <p className="text-sm text-indigo-600">Your Balance</p>
              <h2 className="text-3xl font-bold text-indigo-700">
                {points}
              </h2>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <div className="bg-yellow-50 rounded-2xl p-5">
              <Trophy className="text-yellow-600" />
              <p className="text-sm mt-2 text-yellow-700">
                Total Badges
              </p>
              <h2 className="text-3xl font-bold text-yellow-800">
                5
              </h2>
            </div>

            <div className="bg-purple-50 rounded-2xl p-5">
              <Medal className="text-purple-600" />
              <p className="text-sm mt-2 text-purple-700">
                Current Rank
              </p>
              <h2 className="text-3xl font-bold text-purple-800">
                Level 3
              </h2>
            </div>

            <div className="bg-green-50 rounded-2xl p-5">
              <Star className="text-green-600" />
              <p className="text-sm mt-2 text-green-700">
                Redeemed
              </p>
              <h2 className="text-3xl font-bold text-green-800">
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
                  className="bg-slate-50 rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition"
                >
                  <div className="text-4xl">{item.icon}</div>

                  <h3 className="font-semibold text-slate-800 mt-4">
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    {item.cost} Points
                  </p>

                  <button
                    onClick={() => redeemReward(i)}
                    disabled={!unlocked || item.redeemed}
                    className={`mt-4 w-full py-2 rounded-xl text-sm font-medium ${
                      item.redeemed
                        ? "bg-green-600 text-white"
                        : unlocked
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "bg-slate-200 text-slate-500 cursor-not-allowed"
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
          <div className="mt-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-6 text-white">
            <h3 className="text-xl font-semibold">
              Keep Reporting & Earn More!
            </h3>

            <p className="text-sm mt-2 text-indigo-100">
              You need only {500 - points > 0 ? 500 - points : 0} more points to reach Level 4.
            </p>

            <div className="w-full h-2 bg-white/20 rounded-full mt-4 overflow-hidden">
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