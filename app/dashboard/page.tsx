'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/db/client';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState<any | null>(null);
  const [findings, setFindings] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', user.id)
      .order('scanned_at', { ascending: false });

    if (error) console.error(error);
    else setScans(data || []);
    setLoading(false);
  }

  async function viewFindings(scanId: string) {
    const { data, error } = await supabase
      .from('findings')
      .select('*')
      .eq('scan_id', scanId)
      .order('risk', { ascending: false });

    if (error) console.error(error);
    else {
      setFindings(data || []);
      setSelectedScan(scans.find(s => s.id === scanId) || null);
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'High': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  if (loading) return <div className="flex justify-center py-20 text-slate-500">Loading your scans...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Scan Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of your synthetic PII detections</p>
        </div>
        <button
          onClick={() => router.push('/scan')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-indigo-700 transition-colors"
        >
          + New Scan
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Scans</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{scans.length}</p>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Findings</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            {scans.reduce((acc, s) => acc + s.finding_count, 0)}
          </p>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Highest Risk</p>
          <p className={`text-3xl font-bold mt-2 ${getRiskColor('Critical').split(' ')[0]}`}>
            {scans.length > 0 ? scans[0].risk : 'None'}
          </p>
        </div>
      </div>

      {/* Scans Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Filename</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Findings</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Risk</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {scans.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No scans found. Start by uploading a file.</td>
              </tr>
            ) : (
              scans.map(scan => (
                <tr key={scan.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{scan.filename}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(scan.scanned_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{scan.finding_count}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getRiskColor(scan.risk)}`}>
                      {scan.risk}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => viewFindings(scan.id)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Findings Detail Modal */}
      {selectedScan && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Findings for {selectedScan.filename}</h2>
              <button onClick={() => setSelectedScan(null)} className="text-slate-400 hover:text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {findings.length === 0 ? (
                <div className="text-center py-12 text-slate-400">No sensitive data detected.</div>
              ) : (
                <div className="space-y-4">
                  {findings.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${
                          f.risk === 'Critical' ? 'bg-red-600' :
                          f.risk === 'High' ? 'bg-orange-600' :
                          f.risk === 'Medium' ? 'bg-amber-600' : 'bg-blue-600'
                        }`} />
                        <div>
                          <p className="text-sm font-bold text-slate-900">{f.type}</p>
                          <p className="text-xs text-slate-500">Detected {f.match_count} occurrences</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-mono bg-slate-100 px-2 py-1 rounded border border-slate-200 text-slate-600">
                          {f.masked_example}
                        </p>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">{f.risk} Risk</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedScan(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
