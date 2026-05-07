import CrimeByMonth from "@/components/layout/Analytics/CrimeByMonth"
import CrimeSpikeOverTime from "@/components/layout/Analytics/CrimeSpikeOverTime"
import CrimeTypeDistribution from "@/components/layout/Analytics/CrimeTypeDistribution"
import MissingPersonbyAgeGroup from "@/components/layout/Analytics/MissingPersonbyAgeGroup"
import MissingPersonTrendByGender from "@/components/layout/Analytics/MissingPersonTrendByGender"
import ReportsByStatus from "@/components/layout/Analytics/ReportsByStatus"
import Top5CrimeLocations from "@/components/layout/Analytics/Top5CrimeLocations"
import KPI from "@/components/layout/Analytics/KPI"

export default function Analytics() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">

      {/* KPI Row */}
      <section>
        <KPI />
      </section>

      {/* Row 1 — Full width */}
      <section>
        <CrimeByMonth />
      </section>

      {/* Row 2 — 2 columns */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <CrimeSpikeOverTime />
        <CrimeTypeDistribution />
      </section>

      {/* Row 3 — 4 columns */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MissingPersonbyAgeGroup />
        <MissingPersonTrendByGender />
        <ReportsByStatus />
        <Top5CrimeLocations />
      </section>


    </div>
  )
}