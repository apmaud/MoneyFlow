import { Box } from "@mui/material";
import "./MoneyFlowHero.css";
import { brandTokens } from "../../theme/theme";

export default function MoneyFlowHero({ size = 420 }) {
  const paths = [
    "M120,110 C170,60 250,60 300,110",
    "M300,110 C330,180 330,240 300,300",
    "M300,300 C250,340 170,340 120,300",
    "M120,300 C90,240 90,180 120,110",
  ];

  return (
    <Box
      className="money-flow-hero"
      sx={{
        width: "100%",
        maxWidth: size,
        mx: "auto",
        aspectRatio: "1 / 1",
      }}
    >
      <svg viewBox="0 0 420 420" width="100%" height="100%" role="img" aria-label="Illustration of money moving between three accounts">
        {paths.map((d, i) => (
          <path key={i} d={d} fill="none" stroke={brandTokens.mistDeep} strokeWidth="2" />
        ))}

        <circle className="account-node" cx="120" cy="110" r="46" fill={brandTokens.lavenderLight} opacity="0.9" />
        <circle className="account-node" cx="300" cy="110" r="38" fill={brandTokens.lavender} opacity="0.9" />
        <circle className="account-node" cx="210" cy="300" r="52" fill={brandTokens.plumSoft} opacity="0.85" />

        {paths.map((d, i) => (
          <circle key={`dot-${i}`} r="5" fill={brandTokens.white}>
            <animateMotion dur={`${4 + i}s`} repeatCount="indefinite" path={d} rotate="auto" begin={`${i * 0.9}s`} />
          </circle>
        ))}
      </svg>
    </Box>
  );
}
