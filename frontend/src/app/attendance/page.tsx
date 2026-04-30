'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  RiWirelessChargingLine, 
  RiRefreshLine, 
  RiCalendarCheckLine,
  RiBook3Line,
  RiArrowDownSLine,
  RiFileDownloadLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiDashboardHorizontalLine,
  RiFilter3Line,
  RiGlobalLine,
  RiAddLine,
  RiTabletLine,
  RiSmartphoneLine,
  RiComputerLine,
  RiBattery2Fill,
  RiSignalTowerFill,
  RiHistoryFill,
  RiPulseLine,
  RiErrorWarningLine,
  RiWifiOffLine,
  RiHardDrive2Line,
  RiShutDownLine,
  RiCheckboxCircleFill
} from 'react-icons/ri';
import * as SC from './attendance.sc';
import { api } from '@/services/api';
import Modal from '@/components/ui/Modal';
import { toast } from 'react-hot-toast';
import { useAttendance, useDevices } from '@/hooks/useAttendance';
import { useAttendanceStore } from '@/store/useAttendanceStore';
import { useQueryClient, useQuery } from '@tanstack/react-query';

/* ─── Types & Data ─── */
interface AttendanceRecord {
  id: string;
  name: string;
  status: 'Present' | 'Absent' | 'Late';
  time: string;
  subtext: string;
  avatarBg?: string;
  className: string;
}

interface DeviceNode {
  id: string;
  name: string;
  type: 'tablet' | 'handheld' | 'panel' | 'panel-east';
  status: 'active' | 'offline';
  battery: number;
  network: string;
  lastSync: string;
  localDB: string;
  totalDB: string;
}

const COLORS = ['#818CF8', '#34D399', '#F472B6', '#10B981', '#FB923C', '#60A5FA', '#A78BFA'];
const randomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

const WS_URL = 'ws://localhost:8000/ws/attendance';
const API_URL = 'http://localhost:8000';

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState<'attendance' | 'devices'>('attendance');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const queryClient = useQueryClient();
  
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [tempClasses, setTempClasses] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch classes
  const { data: allClasses = [] } = useQuery<string[]>({
    queryKey: ['classes'],
    queryFn: async () => {
      const res = await api.get<string[]>('/students/classes');
      return res;
    }
  });

  // Initialize temp classes when data arrives
  useEffect(() => {
    if (allClasses.length > 0 && tempClasses.length === 0) {
      setTempClasses(allClasses);
    }
  }, [allClasses]);

  const { data: attendanceData, isLoading: isAttendanceLoading } = useAttendance(
    selectedClasses.length === 0 ? undefined : selectedClasses.join(',')
  );
  const { data: devicesData } = useDevices();
  const { events: logs, addEvent } = useAttendanceStore();

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [toggles, setToggles] = useState<Record<string, boolean>>({});
  const [wsStatus, setWsStatus] = useState<'connecting' | 'live' | 'offline'>('connecting');

  // Sync temp classes when modal opens
  useEffect(() => {
    if (isFilterOpen) {
      setTempClasses(selectedClasses.length === 0 ? allClasses : [...selectedClasses]);
    }
  }, [isFilterOpen, selectedClasses, allClasses]);

  const wsRef = useRef<WebSocket | null>(null);

  // ─── Real-time WebSocket connection ──────────────────────────────────────
  const connectWs = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    // Use a small delay before connecting to ensure clean state
      setTimeout(() => {
        setWsStatus('connecting');
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;
  
        ws.onopen = () => {
          setWsStatus('live');
          console.log('[WS] Connected to attendance stream');
          setIsRefreshing(false); // Stop animation on connect
        };
  
        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'attendance_event') {
              const data = msg.data;
              const timeStr = new Date(data.timestamp ?? Date.now()).toLocaleTimeString([], { 
                hour: '2-digit', minute: '2-digit', second: '2-digit' 
              });
  
              if (data.status === 'success') {
                // Add to store (persisted)
                addEvent({
                  type: 'Scan Success',
                  msg: `Verified ${data.student_name}`,
                  time: timeStr,
                  device: data.scanner_name ?? 'Mobile',
                  status: 'success',
                  student_name: data.student_name
                });
  
                // Refresh React Query to show all marked students
                queryClient.invalidateQueries({ queryKey: ['attendance'] });
                
                toast.success(`✓ ${data.student_name} via ${data.scanner_name ?? 'App'}`);
              } else {
                // Add to store (persisted)
                addEvent({
                  type: 'Scan Failure',
                  msg: `${data.message ?? 'Unknown face'}`,
                  time: timeStr,
                  device: data.scanner_name ?? data.device_id ?? 'Scanner',
                  status: 'fail'
                });
  
                toast.error(`✗ ${data.message ?? 'Scan failed'} on ${data.scanner_name ?? 'device'}`);
              }
            }
          } catch (e) {
            console.error('[WS] Parse error:', e);
          }
        };
  
        ws.onerror = (e) => {
          console.error('[WS] Connection error', e);
          setWsStatus('offline');
          setIsRefreshing(false);
        };
  
        ws.onclose = () => {
          setWsStatus('offline');
          setIsRefreshing(false);
        };
      }, 100);
    }, [addEvent, queryClient]);
  
    const handleRefresh = () => {
      setIsRefreshing(true);
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      connectWs();
      setTimeout(() => setIsRefreshing(false), 2000); // Fallback to stop after 2s
    };

  useEffect(() => {
    if (attendanceData) {
      const mapped: AttendanceRecord[] = attendanceData.map((a: any) => ({
        id: a.student_id || a.id || '—',
        name: a.name || a.student_name || 'Unknown Student',
        status: (a.status as any) || 'Present',
        time: a.check_in_time || '—',
        subtext: (a.program || a.class_name || 'N/A') + (a.section ? ` • Section ${a.section}` : ''),
        avatarBg: randomColor(),
        className: a.program || a.class_name || 'Unknown',
      }));
      setRecords(mapped);
    }
  }, [attendanceData]);

  useEffect(() => {
    connectWs();
    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [connectWs]);

  /* ─── Devices State Sync ─── */
  const [devices, setDevices] = useState<DeviceNode[]>([]);
  useEffect(() => {
    if (devicesData) {
      const mappedDevices: DeviceNode[] = devicesData.map((d: any) => ({
        id: d.device_id,
        name: d.device_name || d.device_id,
        type: (d.device_type?.toLowerCase() as any) || 'handheld',
        status: d.status as any,
        battery: d.battery_level || 0,
        network: d.ip_address || 'LAN',
        lastSync: d.last_sync || 'Never',
        localDB: 'Active',
        totalDB: 'Cloud'
      }));
      setDevices(mappedDevices);
    }
  }, [devicesData]);

  const handleToggle = (id: string) => {
    setToggles(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleApplyFilters = () => {
    setSelectedClasses([...tempClasses]);
    setIsFilterOpen(false);
    toast.success("Institutional logs filtered.");
  };

  // Since the backend already filters based on selectedClasses, we can use records directly.
  // This ensures that live updates via WebSocket (which trigger a refetch) are correctly displayed.
  const filteredRecords = records;

  return (
    <SC.PageWrapper>
      {/* Universal Tab Switcher */}
      <SC.TabContainer>
        <SC.TabButton $active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')}>
          Daily Attendance
        </SC.TabButton>
        <SC.TabButton $active={activeTab === 'devices'} onClick={() => setActiveTab('devices')}>
          Mobile Sync Dashboard
        </SC.TabButton>
      </SC.TabContainer>

      {activeTab === 'attendance' ? (
        <>
          {/* Header Section */}
          <SC.HeaderRow>
            <SC.TitleGroup>
              <span>Attendance Management</span>
              <h1>Daily Classroom Log</h1>
            </SC.TitleGroup>
            
            <SC.CameraStatus>
              <SC.CameraIcon><RiWirelessChargingLine /></SC.CameraIcon>
              <SC.StatusInfo>
                <div className="status" style={{
                  color: wsStatus === 'live' ? '#10B981' : wsStatus === 'connecting' ? '#F59E0B' : '#EF4444'
                }}>
                  {wsStatus === 'live' ? '● Live' : wsStatus === 'connecting' ? '○ Connecting…' : '✕ Offline'}
                </div>
                <div className="cam-name">Mobile Attendance Stream</div>
                <div className="sync">{filteredRecords.length} records in view</div>
              </SC.StatusInfo>
              <SC.RefreshBtn $isRefreshing={isRefreshing} onClick={handleRefresh}>
                <RiRefreshLine size={20} />
              </SC.RefreshBtn>
            </SC.CameraStatus>
          </SC.HeaderRow>

          {/* Filter & Action Row */}
          <SC.FilterSection>
            <SC.FilterGroup>
              <SC.SelectWrapper>
                <RiCalendarCheckLine size={20} />
                <span>Today, {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <RiArrowDownSLine size={18} style={{ marginLeft: 'auto' }} />
              </SC.SelectWrapper>
              <SC.SelectWrapper onClick={() => setIsFilterOpen(true)}>
                <RiFilter3Line size={20} />
                <span>{selectedClasses.length === 0 ? 'All Institutional Classes' : `${selectedClasses.length} Classes Selected`}</span>
                <RiArrowDownSLine size={18} style={{ marginLeft: 'auto' }} />
              </SC.SelectWrapper>
            </SC.FilterGroup>
            {/* Export button removed as requested */}
          </SC.FilterSection>

          {/* Attendance Table */}
          <SC.TableCard>
            <SC.AttendanceTable>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Student ID</th>
                  <th>Status</th>
                  <th>Time Logged</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map(student => (
                  <tr key={student.id}>
                    <td>
                      <SC.StudentCell>
                        <SC.Avatar $bg={student.avatarBg}>{student.name[0]}</SC.Avatar>
                        <SC.StudentInfo><h4>{student.name}</h4><p>{student.className} • {student.subtext}</p></SC.StudentInfo>
                      </SC.StudentCell>
                    </td>
                    <td><SC.IDBadge>{student.id}</SC.IDBadge></td>
                    <td><SC.StatusPill $status={student.status}>{student.status}</SC.StatusPill></td>
                    <td><SC.TimeText>{student.time}</SC.TimeText></td>
                    <td><SC.ActionCell>
                      <SC.ToggleSwitch $active={toggles[student.id]} onClick={() => handleToggle(student.id)} />
                      <SC.EditLink>Edit</SC.EditLink>
                    </SC.ActionCell></td>
                  </tr>
                ))}
              </tbody>
            </SC.AttendanceTable>
          </SC.TableCard>

          <Modal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Institutional Class Selection">
            <SC.ClassGrid>
              {allClasses.map(cls => (
                <SC.ClassOption key={cls}>
                  <SC.Checkbox type="checkbox" checked={tempClasses.includes(cls)} onChange={() => setTempClasses(prev => prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls])} />
                  <SC.ClassLabel>{cls}</SC.ClassLabel>
                </SC.ClassOption>
              ))}
            </SC.ClassGrid>
            <SC.ModalActions>
              <SC.ActionBtn $variant="reset" onClick={() => setTempClasses([])}>Deselect All</SC.ActionBtn>
              <SC.ActionBtn $variant="secondary" onClick={() => setTempClasses([...allClasses])}>Select All</SC.ActionBtn>
              <SC.ActionBtn $variant="primary" onClick={handleApplyFilters}>Apply Filters</SC.ActionBtn>
            </SC.ModalActions>
          </Modal>
        </>
      ) : (
        /* ─── Mobile Sync Dashboard View ─── */
        <>
          <SC.DashboardHeader>
            <SC.TitleGroup>
              <h1>Mobile Sync Dashboard</h1>
              <SC.PageSubtitle>Monitoring {devices.length} connected edge nodes across the campus.</SC.PageSubtitle>
            </SC.TitleGroup>
            <SC.HeaderActions>
              <SC.SyncButton onClick={() => toast.success("Orchestrating global synchronization...")}>
                <RiGlobalLine size={20} /> Global Sync
              </SC.SyncButton>
              <SC.SyncButton $primary onClick={() => toast.success("Initializing node registration wizard...")}>
                <RiAddLine size={20} /> Register Node
              </SC.SyncButton>
            </SC.HeaderActions>
          </SC.DashboardHeader>

          <SC.DeviceGrid>
            <div className="main-feed">
              <SC.SummaryRow>
                <h3>Connected Devices</h3>
                <SC.NodeStatusGroup>
                  <SC.NodeBadge>Online: {devices.filter(d => d.status === 'active').length}</SC.NodeBadge>
                  <SC.NodeBadge $offline>Offline: {devices.filter(d => d.status === 'offline').length}</SC.NodeBadge>
                </SC.NodeStatusGroup>
              </SC.SummaryRow>

              {devices.map(dev => (
                <SC.DeviceCard key={dev.id} $offline={dev.status === 'offline'}>
                  <SC.DeviceIcon>
                    {dev.type === 'tablet' ? <RiTabletLine /> : 
                     dev.type === 'handheld' ? <RiSmartphoneLine /> : <RiComputerLine />}
                  </SC.DeviceIcon>
                  <SC.DeviceMain>
                    <SC.DeviceTitleLine>
                      <h4>{dev.name}</h4>
                      <span className={dev.status === 'offline' ? 'offline' : ''}>
                        {dev.status === 'active' ? 'Active Now' : 'Offline'}
                      </span>
                    </SC.DeviceTitleLine>
                    <SC.DeviceMetrics>
                      <div><RiBattery2Fill /> {dev.battery}%</div>
                      <div><RiSignalTowerFill /> {dev.network}</div>
                      <div><RiHistoryFill /> {dev.lastSync}</div>
                    </SC.DeviceMetrics>
                  </SC.DeviceMain>
                  <SC.DBMetric>
                    <p>Local DB</p>
                    <span>{dev.localDB} / {dev.totalDB}</span>
                  </SC.DBMetric>
                  <SC.DeviceActions>
                    {dev.status === 'offline' ? (
                      <SC.RebootBtn onClick={() => toast.loading(`Attempting remote reboot for ${dev.name}...`)}>
                        Reboot Node
                      </SC.RebootBtn>
                    ) : (
                      <>
                        <SC.RoundAction onClick={() => toast.success(`Force synchronization for ${dev.name} initialized.`)}>
                          <RiRefreshLine />
                        </SC.RoundAction>
                        <SC.RoundAction $danger onClick={() => toast.error(`Shutdown command sent to ${dev.name}.`)}>
                          <RiShutDownLine />
                        </SC.RoundAction>
                      </>
                    )}
                  </SC.DeviceActions>
                </SC.DeviceCard>
              ))}
            </div>

            <div className="side-panel">
              {/* <SC.HealthCard>
                <span>Network Health</span>
                <h2>99.8%</h2>
                <SC.EfficiencyBar>
                  <div className="label"><span>Sync Efficiency</span><span>High</span></div>
                  <div className="track"><div className="fill" /></div>
                </SC.EfficiencyBar>
                <div style={{ marginTop: '20px', fontSize: '0.8125rem', opacity: 0.8, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Node Latency</span>
                  <strong>14ms</strong>
                </div>
              </SC.HealthCard> */}

              <SC.LogsCard>
                <div className="header">
                   <h3>Recent Mobile Events</h3>
                   <RiPulseLine size={24} />
                </div>
                
                <SC.LogsScrollArea>
                  {logs.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', opacity: 0.5 }}>
                      <p>No recent alerts.</p>
                    </div>
                  ) : (
                    logs.map(log => (
                      <SC.ErrorLog key={log.id}>
                        <div className="icon-box" style={{ 
                          background: log.status === 'success' ? 'rgba(16, 185, 129, 0.1)' : '#FEF2F2', 
                          color: log.status === 'success' ? '#10B981' : '#EF4444' 
                        }}>
                          {log.status === 'success' ? <RiCheckboxCircleFill size={18} /> : <RiErrorWarningLine />}
                        </div>
                        <div className="details">
                          <div className="meta">
                            <label style={{ color: log.status === 'success' ? '#10B981' : '#EF4444' }}>{log.type}</label>
                            <time>{log.time}</time>
                          </div>
                          <p>{log.device}: {log.msg}</p>
                        </div>
                      </SC.ErrorLog>
                    ))
                  )}
                </SC.LogsScrollArea>

                <SC.AuditBtn onClick={() => {
                  if (confirm('Clear all persisted events?')) {
                    useAttendanceStore.getState().clearEvents();
                    toast.success('Event log cleared');
                  }
                }}>
                  Clear Event Log
                </SC.AuditBtn>
              </SC.LogsCard>
            </div>
          </SC.DeviceGrid>
        </>
      )}
    </SC.PageWrapper>
  );
}
