'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { PlusIcon, UserGroupIcon, ChartBarIcon, GiftIcon } from '@heroicons/react/24/outline';

interface GroupMember {
  _id: string;
  user: {
    _id: string;
    first_name: string;
    last_name: string;
    mobile: string;
  };
  status: 'Active' | 'Pending' | 'Removed' | 'Suspended';
  role: 'Member' | 'CoLeader' | 'Admin';
  join_date: string;
  enrollments_count: number;
  completed_courses: number;
  total_savings: number;
}

interface GroupInfo {
  _id: string;
  name: string;
  type: string;
  status: string;
  group_code: string;
  current_member_count: number;
  max_members: number;
  discount_percentage: number;
  total_savings: number;
  total_enrollments: number;
  completed_courses: number;
  certificates_issued: number;
  leader: {
    _id: string;
    first_name: string;
    last_name: string;
    mobile: string;
  };
  company_name?: string;
}

interface GroupStats {
  active_members: number;
  pending_members: number;
  total_group_savings: number;
  average_savings_per_member: number;
  most_active_member?: {
    user: {
      _id: string;
      first_name: string;
      last_name: string;
    };
    enrollments_count: number;
    completed_courses: number;
  };
  completion_rate: number;
}

export default function GroupDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [statistics, setStatistics] = useState<GroupStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberMobile, setNewMemberMobile] = useState('');
  const [addingMember, setAddingMember] = useState(false);

  // For demo purposes, using mock data
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    // Mock data for demonstration
    const mockGroupInfo: GroupInfo = {
      _id: '1',
      name: 'گروه معماری پایدار',
      type: 'Regular',
      status: 'Active',
      group_code: 'GROUP-ABC123',
      current_member_count: 8,
      max_members: 50,
      discount_percentage: 15,
      total_savings: 2400000,
      total_enrollments: 12,
      completed_courses: 8,
      certificates_issued: 6,
      leader: {
        _id: '1',
        first_name: 'احمد',
        last_name: 'محمدی',
        mobile: '09123456789',
      },
    };

    const mockMembers: GroupMember[] = [
      {
        _id: '1',
        user: {
          _id: '1',
          first_name: 'احمد',
          last_name: 'محمدی',
          mobile: '09123456789',
        },
        status: 'Active',
        role: 'Admin',
        join_date: '2024-01-15T10:30:00Z',
        enrollments_count: 3,
        completed_courses: 2,
        total_savings: 450000,
      },
      {
        _id: '2',
        user: {
          _id: '2',
          first_name: 'فاطمه',
          last_name: 'احمدی',
          mobile: '09123456788',
        },
        status: 'Active',
        role: 'Member',
        join_date: '2024-01-20T14:15:00Z',
        enrollments_count: 2,
        completed_courses: 1,
        total_savings: 300000,
      },
      {
        _id: '3',
        user: {
          _id: '3',
          first_name: 'علی',
          last_name: 'رضایی',
          mobile: '09123456787',
        },
        status: 'Pending',
        role: 'Member',
        join_date: '2024-02-01T09:00:00Z',
        enrollments_count: 0,
        completed_courses: 0,
        total_savings: 0,
      },
    ];

    const mockStatistics: GroupStats = {
      active_members: 7,
      pending_members: 1,
      total_group_savings: 2400000,
      average_savings_per_member: 342857,
      most_active_member: {
        user: {
          _id: '1',
          first_name: 'احمد',
          last_name: 'محمدی',
        },
        enrollments_count: 3,
        completed_courses: 2,
      },
      completion_rate: 67,
    };

    setGroupInfo(mockGroupInfo);
    setMembers(mockMembers);
    setStatistics(mockStatistics);
    setIsLoading(false);
  }, [user, loading, router]);

  const handleAddMember = async () => {
    if (!newMemberMobile.trim()) return;

    setAddingMember(true);

    // Mock adding member process
    setTimeout(() => {
      const newMember: GroupMember = {
        _id: Date.now().toString(),
        user: {
          _id: Date.now().toString(),
          first_name: 'کاربر',
          last_name: 'جدید',
          mobile: newMemberMobile,
        },
        status: 'Pending',
        role: 'Member',
        join_date: new Date().toISOString(),
        enrollments_count: 0,
        completed_courses: 0,
        total_savings: 0,
      };

      setMembers([...members, newMember]);
      setNewMemberMobile('');
      setShowAddMember(false);
      setAddingMember(false);
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-600';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-600';
      case 'Suspended':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Active':
        return 'فعال';
      case 'Pending':
        return 'در انتظار';
      case 'Suspended':
        return 'معلق';
      case 'Removed':
        return 'حذف شده';
      default:
        return 'نامشخص';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'مدیر';
      case 'CoLeader':
        return 'مدیر مشارک';
      case 'Member':
        return 'عضو';
      default:
        return 'نامشخص';
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader"></div>
      </div>
    );
  }

  if (!groupInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-text-primary mb-4">گروهی یافت نشد</h1>
        <p className="text-text-secondary">لطفاً ابتدا گروهی ایجاد کنید یا به گروهی ملحق شوید.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-6xl mx-auto p-6 dir-rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-text-primary">مدیریت گروه</h1>
          <p className="text-text-secondary mt-1">{groupInfo.name}</p>
        </div>
        <button
          onClick={() => setShowAddMember(true)}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          افزودن عضو جدید
        </button>
      </div>

      {/* Group Statistics */}
      <div className="flex flex-wrap gap-6 mb-8">
        <div className="flex flex-col flex-1 min-w-60 bg-background-primary p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <UserGroupIcon className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-bold text-text-primary">تعداد اعضا</h3>
          </div>
          <p className="text-3xl font-bold text-primary">{groupInfo.current_member_count}</p>
          <p className="text-sm text-text-secondary mt-1">از {groupInfo.max_members} نفر</p>
        </div>

        <div className="flex flex-col flex-1 min-w-60 bg-green-50 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <GiftIcon className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-bold text-text-primary">تخفیف گروهی</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">{groupInfo.discount_percentage}%</p>
          <p className="text-sm text-text-secondary mt-1">
            {groupInfo.discount_percentage >= 25 ? 'پلاتین' :
             groupInfo.discount_percentage >= 20 ? 'طلایی' :
             groupInfo.discount_percentage >= 15 ? 'نقره‌ای' :
             groupInfo.discount_percentage >= 10 ? 'برنزی' : 'بدون تخفیف'}
          </p>
        </div>

        <div className="flex flex-col flex-1 min-w-60 bg-blue-50 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <ChartBarIcon className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-bold text-text-primary">صرفه‌جویی کل</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">{groupInfo.total_savings.toLocaleString()}</p>
          <p className="text-sm text-text-secondary mt-1">تومان</p>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="flex flex-wrap gap-6 mb-8">
        <div className="flex flex-col flex-1 min-w-48 bg-background-primary p-4 rounded-lg">
          <h4 className="text-sm font-medium text-text-secondary mb-1">کل ثبت‌نام‌ها</h4>
          <p className="text-2xl font-bold text-text-primary">{groupInfo.total_enrollments}</p>
        </div>

        <div className="flex flex-col flex-1 min-w-48 bg-background-primary p-4 rounded-lg">
          <h4 className="text-sm font-medium text-text-secondary mb-1">دوره‌های تکمیل شده</h4>
          <p className="text-2xl font-bold text-text-primary">{groupInfo.completed_courses}</p>
        </div>

        <div className="flex flex-col flex-1 min-w-48 bg-background-primary p-4 rounded-lg">
          <h4 className="text-sm font-medium text-text-secondary mb-1">گواهی‌های صادر شده</h4>
          <p className="text-2xl font-bold text-text-primary">{groupInfo.certificates_issued}</p>
        </div>

        {statistics && (
          <div className="flex flex-col flex-1 min-w-48 bg-background-primary p-4 rounded-lg">
            <h4 className="text-sm font-medium text-text-secondary mb-1">نرخ تکمیل</h4>
            <p className="text-2xl font-bold text-text-primary">{statistics.completion_rate}%</p>
          </div>
        )}
      </div>

      {/* Group Members */}
      <div className="flex flex-col bg-background-primary rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-primary">اعضای گروه</h2>
          <div className="flex items-center gap-4 text-sm text-text-secondary">
            <span>کد گروه: {groupInfo.group_code}</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {members.map((member) => (
            <div key={member._id} className="flex items-center justify-between p-4 border border-background-secondary rounded-lg hover:bg-background-secondary transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  {member.user.first_name.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <h3 className="font-bold text-text-primary">
                    {member.user.first_name} {member.user.last_name}
                  </h3>
                  <p className="text-text-secondary text-sm">{member.user.mobile}</p>
                  <p className="text-text-light text-xs">{getRoleText(member.role)}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex flex-col text-center">
                  <span className="text-sm font-medium text-text-primary">{member.enrollments_count}</span>
                  <span className="text-xs text-text-secondary">ثبت‌نام</span>
                </div>

                <div className="flex flex-col text-center">
                  <span className="text-sm font-medium text-text-primary">{member.completed_courses}</span>
                  <span className="text-xs text-text-secondary">تکمیل شده</span>
                </div>

                <div className="flex flex-col text-center">
                  <span className="text-sm font-medium text-text-primary">{member.total_savings.toLocaleString()}</span>
                  <span className="text-xs text-text-secondary">صرفه‌جویی</span>
                </div>

                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(member.status)}`}>
                  {getStatusText(member.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">افزودن عضو جدید</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  شماره موبایل
                </label>
                <input
                  type="text"
                  value={newMemberMobile}
                  onChange={(e) => setNewMemberMobile(e.target.value)}
                  className="w-full px-3 py-2 border border-background-darkest rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="09123456789"
                  dir="ltr"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddMember}
                  disabled={addingMember || !newMemberMobile.trim()}
                  className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingMember ? 'در حال افزودن...' : 'افزودن'}
                </button>
                <button
                  onClick={() => {
                    setShowAddMember(false);
                    setNewMemberMobile('');
                  }}
                  className="flex-1 bg-background-secondary text-text-primary py-2 px-4 rounded-lg hover:bg-background-darkest"
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
