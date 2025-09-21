
/* eslint-disable */

  
    export type userInp = {
      avatar?: number | fileInp
national_card?: number | fileInp
      uploadedAssets?: number | fileInp
articles?: number | articleInp
edited_articles?: number | articleInp
liked_articles?: number | articleInp
bookmarked_articles?: number | articleInp
taught_courses?: number | courseInp
enrolled_courses?: number | courseInp
created_courses?: number | courseInp
enrollments?: number | enrollmentInp
    }


    export type userSchema = {
_id?: string;
first_name: string;
last_name: string;
father_name: string;
mobile: string;
gender: ("Male" | "Female" );
birth_date?: Date;
summary?: string;
national_number: string;
address: string;
level: ("Ghost" | "Manager" | "Editor" | "Ordinary" );
is_verified: boolean;
createdAt: Date;
updatedAt: Date;
avatar?: {
_id?: string;
name: string;
type: string;
size: number;
path: string;
url: string;
createdAt: Date;
updatedAt: Date;
};
national_card?: {
_id?: string;
name: string;
type: string;
size: number;
path: string;
url: string;
createdAt: Date;
updatedAt: Date;
};
uploadedAssets: {
_id?: string;
name: string;
type: string;
size: number;
path: string;
url: string;
createdAt: Date;
updatedAt: Date;
}[];
articles: {
_id?: string;
title: string;
content: string;
excerpt?: string;
title_en?: string;
content_en?: string;
excerpt_en?: string;
status: ("Draft" | "Published" | "Archived" | "Scheduled" );
type: ("Article" | "News" | "Research" | "Tutorial" | "Interview" );
published_at?: Date;
scheduled_at?: Date;
featured: boolean;
pinned: boolean;
sort_order: number;
slug?: string;
meta_title?: string;
meta_description?: string;
meta_title_en?: string;
meta_description_en?: string;
view_count: number;
like_count: number;
comment_count: number;
share_count: number;
estimated_reading_time?: number;
allow_comments: boolean;
featured_on_homepage: boolean;
social_image_alt?: string;
social_image_alt_en?: string;
abstract?: string;
abstract_en?: string;
keywords?: string;
keywords_en?: string;
doi?: string;
citation?: string;
has_gallery: boolean;
video_url?: string;
audio_url?: string;
archive_date?: Date;
last_modified_by_name?: string;
is_premium: boolean;
requires_login: boolean;
createdAt: Date;
updatedAt: Date;
}[];
edited_articles: {
_id?: string;
title: string;
content: string;
excerpt?: string;
title_en?: string;
content_en?: string;
excerpt_en?: string;
status: ("Draft" | "Published" | "Archived" | "Scheduled" );
type: ("Article" | "News" | "Research" | "Tutorial" | "Interview" );
published_at?: Date;
scheduled_at?: Date;
featured: boolean;
pinned: boolean;
sort_order: number;
slug?: string;
meta_title?: string;
meta_description?: string;
meta_title_en?: string;
meta_description_en?: string;
view_count: number;
like_count: number;
comment_count: number;
share_count: number;
estimated_reading_time?: number;
allow_comments: boolean;
featured_on_homepage: boolean;
social_image_alt?: string;
social_image_alt_en?: string;
abstract?: string;
abstract_en?: string;
keywords?: string;
keywords_en?: string;
doi?: string;
citation?: string;
has_gallery: boolean;
video_url?: string;
audio_url?: string;
archive_date?: Date;
last_modified_by_name?: string;
is_premium: boolean;
requires_login: boolean;
createdAt: Date;
updatedAt: Date;
}[];
liked_articles: {
_id?: string;
title: string;
content: string;
excerpt?: string;
title_en?: string;
content_en?: string;
excerpt_en?: string;
status: ("Draft" | "Published" | "Archived" | "Scheduled" );
type: ("Article" | "News" | "Research" | "Tutorial" | "Interview" );
published_at?: Date;
scheduled_at?: Date;
featured: boolean;
pinned: boolean;
sort_order: number;
slug?: string;
meta_title?: string;
meta_description?: string;
meta_title_en?: string;
meta_description_en?: string;
view_count: number;
like_count: number;
comment_count: number;
share_count: number;
estimated_reading_time?: number;
allow_comments: boolean;
featured_on_homepage: boolean;
social_image_alt?: string;
social_image_alt_en?: string;
abstract?: string;
abstract_en?: string;
keywords?: string;
keywords_en?: string;
doi?: string;
citation?: string;
has_gallery: boolean;
video_url?: string;
audio_url?: string;
archive_date?: Date;
last_modified_by_name?: string;
is_premium: boolean;
requires_login: boolean;
createdAt: Date;
updatedAt: Date;
}[];
bookmarked_articles: {
_id?: string;
title: string;
content: string;
excerpt?: string;
title_en?: string;
content_en?: string;
excerpt_en?: string;
status: ("Draft" | "Published" | "Archived" | "Scheduled" );
type: ("Article" | "News" | "Research" | "Tutorial" | "Interview" );
published_at?: Date;
scheduled_at?: Date;
featured: boolean;
pinned: boolean;
sort_order: number;
slug?: string;
meta_title?: string;
meta_description?: string;
meta_title_en?: string;
meta_description_en?: string;
view_count: number;
like_count: number;
comment_count: number;
share_count: number;
estimated_reading_time?: number;
allow_comments: boolean;
featured_on_homepage: boolean;
social_image_alt?: string;
social_image_alt_en?: string;
abstract?: string;
abstract_en?: string;
keywords?: string;
keywords_en?: string;
doi?: string;
citation?: string;
has_gallery: boolean;
video_url?: string;
audio_url?: string;
archive_date?: Date;
last_modified_by_name?: string;
is_premium: boolean;
requires_login: boolean;
createdAt: Date;
updatedAt: Date;
}[];
taught_courses: {
_id?: string;
name: string;
description: string;
short_description?: string;
name_en?: string;
description_en?: string;
short_description_en?: string;
level: ("Beginner" | "Intermediate" | "Advanced" );
type: ("Course" | "Workshop" | "Bootcamp" | "Seminar" );
status: ("Draft" | "Active" | "Archived" | "Sold_Out" );
price: number;
original_price?: number;
is_free: boolean;
duration_weeks?: number;
duration_hours?: number;
max_students?: number;
min_students: number;
start_date?: Date;
end_date?: Date;
registration_deadline?: Date;
curriculum?: string;
prerequisites?: string;
learning_outcomes?: string;
instructor_name?: string;
instructor_bio?: string;
instructor_bio_en?: string;
average_rating: number;
total_reviews: number;
total_students: number;
slug?: string;
meta_title?: string;
meta_description?: string;
is_workshop: boolean;
workshop_location?: string;
is_online: boolean;
meeting_link?: string;
featured: boolean;
sort_order: number;
completion_points: number;
createdAt: Date;
updatedAt: Date;
}[];
enrolled_courses: {
_id?: string;
name: string;
description: string;
short_description?: string;
name_en?: string;
description_en?: string;
short_description_en?: string;
level: ("Beginner" | "Intermediate" | "Advanced" );
type: ("Course" | "Workshop" | "Bootcamp" | "Seminar" );
status: ("Draft" | "Active" | "Archived" | "Sold_Out" );
price: number;
original_price?: number;
is_free: boolean;
duration_weeks?: number;
duration_hours?: number;
max_students?: number;
min_students: number;
start_date?: Date;
end_date?: Date;
registration_deadline?: Date;
curriculum?: string;
prerequisites?: string;
learning_outcomes?: string;
instructor_name?: string;
instructor_bio?: string;
instructor_bio_en?: string;
average_rating: number;
total_reviews: number;
total_students: number;
slug?: string;
meta_title?: string;
meta_description?: string;
is_workshop: boolean;
workshop_location?: string;
is_online: boolean;
meeting_link?: string;
featured: boolean;
sort_order: number;
completion_points: number;
createdAt: Date;
updatedAt: Date;
}[];
created_courses: {
_id?: string;
name: string;
description: string;
short_description?: string;
name_en?: string;
description_en?: string;
short_description_en?: string;
level: ("Beginner" | "Intermediate" | "Advanced" );
type: ("Course" | "Workshop" | "Bootcamp" | "Seminar" );
status: ("Draft" | "Active" | "Archived" | "Sold_Out" );
price: number;
original_price?: number;
is_free: boolean;
duration_weeks?: number;
duration_hours?: number;
max_students?: number;
min_students: number;
start_date?: Date;
end_date?: Date;
registration_deadline?: Date;
curriculum?: string;
prerequisites?: string;
learning_outcomes?: string;
instructor_name?: string;
instructor_bio?: string;
instructor_bio_en?: string;
average_rating: number;
total_reviews: number;
total_students: number;
slug?: string;
meta_title?: string;
meta_description?: string;
is_workshop: boolean;
workshop_location?: string;
is_online: boolean;
meeting_link?: string;
featured: boolean;
sort_order: number;
completion_points: number;
createdAt: Date;
updatedAt: Date;
}[];
enrollments: {
_id?: string;
enrollment_date: Date;
status: ("Active" | "Completed" | "Dropped" | "Suspended" | "Pending_Payment" );
progress_percentage: number;
completed_date?: Date;
points_earned: number;
points_used_for_enrollment: number;
total_paid: number;
discount_applied: number;
attendance_count: number;
assignment_scores?: string;
final_grade?: number;
certificate_issued: boolean;
certificate_issue_date?: Date;
notes?: string;
createdAt: Date;
updatedAt: Date;
}[];
};
;


    export type fileInp = {
      uploader?: number | userInp
      
    }


    export type fileSchema = {
_id?: string;
name: string;
type: string;
size: number;
path: string;
url: string;
createdAt: Date;
updatedAt: Date;
uploader: {
_id?: string;
first_name: string;
last_name: string;
father_name: string;
mobile: string;
gender: ("Male" | "Female" );
birth_date?: Date;
summary?: string;
national_number: string;
address: string;
level: ("Ghost" | "Manager" | "Editor" | "Ordinary" );
is_verified: boolean;
createdAt: Date;
updatedAt: Date;
};
};
;


    export type tagInp = {
      registrer?: number | userInp
      articles?: number | articleInp
courses?: number | courseInp
    }


    export type tagSchema = {
_id?: string;
name: string;
description: string;
createdAt: Date;
updatedAt: Date;
registrer?: {
_id?: string;
first_name: string;
last_name: string;
father_name: string;
mobile: string;
gender: ("Male" | "Female" );
birth_date?: Date;
summary?: string;
national_number: string;
address: string;
level: ("Ghost" | "Manager" | "Editor" | "Ordinary" );
is_verified: boolean;
createdAt: Date;
updatedAt: Date;
};
articles: {
_id?: string;
title: string;
content: string;
excerpt?: string;
title_en?: string;
content_en?: string;
excerpt_en?: string;
status: ("Draft" | "Published" | "Archived" | "Scheduled" );
type: ("Article" | "News" | "Research" | "Tutorial" | "Interview" );
published_at?: Date;
scheduled_at?: Date;
featured: boolean;
pinned: boolean;
sort_order: number;
slug?: string;
meta_title?: string;
meta_description?: string;
meta_title_en?: string;
meta_description_en?: string;
view_count: number;
like_count: number;
comment_count: number;
share_count: number;
estimated_reading_time?: number;
allow_comments: boolean;
featured_on_homepage: boolean;
social_image_alt?: string;
social_image_alt_en?: string;
abstract?: string;
abstract_en?: string;
keywords?: string;
keywords_en?: string;
doi?: string;
citation?: string;
has_gallery: boolean;
video_url?: string;
audio_url?: string;
archive_date?: Date;
last_modified_by_name?: string;
is_premium: boolean;
requires_login: boolean;
createdAt: Date;
updatedAt: Date;
}[];
courses: {
_id?: string;
name: string;
description: string;
short_description?: string;
name_en?: string;
description_en?: string;
short_description_en?: string;
level: ("Beginner" | "Intermediate" | "Advanced" );
type: ("Course" | "Workshop" | "Bootcamp" | "Seminar" );
status: ("Draft" | "Active" | "Archived" | "Sold_Out" );
price: number;
original_price?: number;
is_free: boolean;
duration_weeks?: number;
duration_hours?: number;
max_students?: number;
min_students: number;
start_date?: Date;
end_date?: Date;
registration_deadline?: Date;
curriculum?: string;
prerequisites?: string;
learning_outcomes?: string;
instructor_name?: string;
instructor_bio?: string;
instructor_bio_en?: string;
average_rating: number;
total_reviews: number;
total_students: number;
slug?: string;
meta_title?: string;
meta_description?: string;
is_workshop: boolean;
workshop_location?: string;
is_online: boolean;
meeting_link?: string;
featured: boolean;
sort_order: number;
completion_points: number;
createdAt: Date;
updatedAt: Date;
}[];
};
;


    export type categoryInp = {
      registrer?: number | userInp
      articles?: number | articleInp
courses?: number | courseInp
    }


    export type categorySchema = {
_id?: string;
name: string;
description: string;
createdAt: Date;
updatedAt: Date;
registrer?: {
_id?: string;
first_name: string;
last_name: string;
father_name: string;
mobile: string;
gender: ("Male" | "Female" );
birth_date?: Date;
summary?: string;
national_number: string;
address: string;
level: ("Ghost" | "Manager" | "Editor" | "Ordinary" );
is_verified: boolean;
createdAt: Date;
updatedAt: Date;
};
articles: {
_id?: string;
title: string;
content: string;
excerpt?: string;
title_en?: string;
content_en?: string;
excerpt_en?: string;
status: ("Draft" | "Published" | "Archived" | "Scheduled" );
type: ("Article" | "News" | "Research" | "Tutorial" | "Interview" );
published_at?: Date;
scheduled_at?: Date;
featured: boolean;
pinned: boolean;
sort_order: number;
slug?: string;
meta_title?: string;
meta_description?: string;
meta_title_en?: string;
meta_description_en?: string;
view_count: number;
like_count: number;
comment_count: number;
share_count: number;
estimated_reading_time?: number;
allow_comments: boolean;
featured_on_homepage: boolean;
social_image_alt?: string;
social_image_alt_en?: string;
abstract?: string;
abstract_en?: string;
keywords?: string;
keywords_en?: string;
doi?: string;
citation?: string;
has_gallery: boolean;
video_url?: string;
audio_url?: string;
archive_date?: Date;
last_modified_by_name?: string;
is_premium: boolean;
requires_login: boolean;
createdAt: Date;
updatedAt: Date;
}[];
courses: {
_id?: string;
name: string;
description: string;
short_description?: string;
name_en?: string;
description_en?: string;
short_description_en?: string;
level: ("Beginner" | "Intermediate" | "Advanced" );
type: ("Course" | "Workshop" | "Bootcamp" | "Seminar" );
status: ("Draft" | "Active" | "Archived" | "Sold_Out" );
price: number;
original_price?: number;
is_free: boolean;
duration_weeks?: number;
duration_hours?: number;
max_students?: number;
min_students: number;
start_date?: Date;
end_date?: Date;
registration_deadline?: Date;
curriculum?: string;
prerequisites?: string;
learning_outcomes?: string;
instructor_name?: string;
instructor_bio?: string;
instructor_bio_en?: string;
average_rating: number;
total_reviews: number;
total_students: number;
slug?: string;
meta_title?: string;
meta_description?: string;
is_workshop: boolean;
workshop_location?: string;
is_online: boolean;
meeting_link?: string;
featured: boolean;
sort_order: number;
completion_points: number;
createdAt: Date;
updatedAt: Date;
}[];
};
;


    export type courseInp = {
      featured_image?: number | fileInp
gallery?: number | fileInp
category?: number | categoryInp
tags?: number | tagInp
instructor?: number | userInp
enrolled_users?: number | userInp
creator?: number | userInp
related_courses?: number | courseInp
prerequisite_courses?: number | courseInp
      enrollments?: number | enrollmentInp
    }


    export type courseSchema = {
_id?: string;
name: string;
description: string;
short_description?: string;
name_en?: string;
description_en?: string;
short_description_en?: string;
level: ("Beginner" | "Intermediate" | "Advanced" );
type: ("Course" | "Workshop" | "Bootcamp" | "Seminar" );
status: ("Draft" | "Active" | "Archived" | "Sold_Out" );
price: number;
original_price?: number;
is_free: boolean;
duration_weeks?: number;
duration_hours?: number;
max_students?: number;
min_students: number;
start_date?: Date;
end_date?: Date;
registration_deadline?: Date;
curriculum?: string;
prerequisites?: string;
learning_outcomes?: string;
instructor_name?: string;
instructor_bio?: string;
instructor_bio_en?: string;
average_rating: number;
total_reviews: number;
total_students: number;
slug?: string;
meta_title?: string;
meta_description?: string;
is_workshop: boolean;
workshop_location?: string;
is_online: boolean;
meeting_link?: string;
featured: boolean;
sort_order: number;
completion_points: number;
createdAt: Date;
updatedAt: Date;
featured_image?: {
_id?: string;
name: string;
type: string;
size: number;
path: string;
url: string;
createdAt: Date;
updatedAt: Date;
};
gallery?: {
_id?: string;
name: string;
type: string;
size: number;
path: string;
url: string;
createdAt: Date;
updatedAt: Date;
}[];
category?: {
_id?: string;
name: string;
description: string;
createdAt: Date;
updatedAt: Date;
};
tags?: {
_id?: string;
name: string;
description: string;
createdAt: Date;
updatedAt: Date;
}[];
instructor?: {
_id?: string;
first_name: string;
last_name: string;
father_name: string;
mobile: string;
gender: ("Male" | "Female" );
birth_date?: Date;
summary?: string;
national_number: string;
address: string;
level: ("Ghost" | "Manager" | "Editor" | "Ordinary" );
is_verified: boolean;
createdAt: Date;
updatedAt: Date;
};
enrolled_users?: {
_id?: string;
first_name: string;
last_name: string;
father_name: string;
mobile: string;
gender: ("Male" | "Female" );
birth_date?: Date;
summary?: string;
national_number: string;
address: string;
level: ("Ghost" | "Manager" | "Editor" | "Ordinary" );
is_verified: boolean;
createdAt: Date;
updatedAt: Date;
}[];
creator?: {
_id?: string;
first_name: string;
last_name: string;
father_name: string;
mobile: string;
gender: ("Male" | "Female" );
birth_date?: Date;
summary?: string;
national_number: string;
address: string;
level: ("Ghost" | "Manager" | "Editor" | "Ordinary" );
is_verified: boolean;
createdAt: Date;
updatedAt: Date;
};
related_courses?: {
_id?: string;
name: string;
description: string;
short_description?: string;
name_en?: string;
description_en?: string;
short_description_en?: string;
level: ("Beginner" | "Intermediate" | "Advanced" );
type: ("Course" | "Workshop" | "Bootcamp" | "Seminar" );
status: ("Draft" | "Active" | "Archived" | "Sold_Out" );
price: number;
original_price?: number;
is_free: boolean;
duration_weeks?: number;
duration_hours?: number;
max_students?: number;
min_students: number;
start_date?: Date;
end_date?: Date;
registration_deadline?: Date;
curriculum?: string;
prerequisites?: string;
learning_outcomes?: string;
instructor_name?: string;
instructor_bio?: string;
instructor_bio_en?: string;
average_rating: number;
total_reviews: number;
total_students: number;
slug?: string;
meta_title?: string;
meta_description?: string;
is_workshop: boolean;
workshop_location?: string;
is_online: boolean;
meeting_link?: string;
featured: boolean;
sort_order: number;
completion_points: number;
createdAt: Date;
updatedAt: Date;
}[];
prerequisite_courses?: {
_id?: string;
name: string;
description: string;
short_description?: string;
name_en?: string;
description_en?: string;
short_description_en?: string;
level: ("Beginner" | "Intermediate" | "Advanced" );
type: ("Course" | "Workshop" | "Bootcamp" | "Seminar" );
status: ("Draft" | "Active" | "Archived" | "Sold_Out" );
price: number;
original_price?: number;
is_free: boolean;
duration_weeks?: number;
duration_hours?: number;
max_students?: number;
min_students: number;
start_date?: Date;
end_date?: Date;
registration_deadline?: Date;
curriculum?: string;
prerequisites?: string;
learning_outcomes?: string;
instructor_name?: string;
instructor_bio?: string;
instructor_bio_en?: string;
average_rating: number;
total_reviews: number;
total_students: number;
slug?: string;
meta_title?: string;
meta_description?: string;
is_workshop: boolean;
workshop_location?: string;
is_online: boolean;
meeting_link?: string;
featured: boolean;
sort_order: number;
completion_points: number;
createdAt: Date;
updatedAt: Date;
}[];
enrollments: {
_id?: string;
enrollment_date: Date;
status: ("Active" | "Completed" | "Dropped" | "Suspended" | "Pending_Payment" );
progress_percentage: number;
completed_date?: Date;
points_earned: number;
points_used_for_enrollment: number;
total_paid: number;
discount_applied: number;
attendance_count: number;
assignment_scores?: string;
final_grade?: number;
certificate_issued: boolean;
certificate_issue_date?: Date;
notes?: string;
createdAt: Date;
updatedAt: Date;
}[];
};
;


    export type articleInp = {
      featured_image?: number | fileInp
gallery?: number | fileInp
social_image?: number | fileInp
category?: number | categoryInp
tags?: number | tagInp
author?: number | userInp
editors?: number | userInp
liked_by?: number | userInp
bookmarked_by?: number | userInp
related_articles?: number | articleInp
related_courses?: number | courseInp
referenced_files?: number | fileInp
      
    }


    export type articleSchema = {
_id?: string;
title: string;
content: string;
excerpt?: string;
title_en?: string;
content_en?: string;
excerpt_en?: string;
status: ("Draft" | "Published" | "Archived" | "Scheduled" );
type: ("Article" | "News" | "Research" | "Tutorial" | "Interview" );
published_at?: Date;
scheduled_at?: Date;
featured: boolean;
pinned: boolean;
sort_order: number;
slug?: string;
meta_title?: string;
meta_description?: string;
meta_title_en?: string;
meta_description_en?: string;
view_count: number;
like_count: number;
comment_count: number;
share_count: number;
estimated_reading_time?: number;
allow_comments: boolean;
featured_on_homepage: boolean;
social_image_alt?: string;
social_image_alt_en?: string;
abstract?: string;
abstract_en?: string;
keywords?: string;
keywords_en?: string;
doi?: string;
citation?: string;
has_gallery: boolean;
video_url?: string;
audio_url?: string;
archive_date?: Date;
last_modified_by_name?: string;
is_premium: boolean;
requires_login: boolean;
createdAt: Date;
updatedAt: Date;
featured_image?: {
_id?: string;
name: string;
type: string;
size: number;
path: string;
url: string;
createdAt: Date;
updatedAt: Date;
};
gallery?: {
_id?: string;
name: string;
type: string;
size: number;
path: string;
url: string;
createdAt: Date;
updatedAt: Date;
}[];
social_image?: {
_id?: string;
name: string;
type: string;
size: number;
path: string;
url: string;
createdAt: Date;
updatedAt: Date;
};
category?: {
_id?: string;
name: string;
description: string;
createdAt: Date;
updatedAt: Date;
};
tags?: {
_id?: string;
name: string;
description: string;
createdAt: Date;
updatedAt: Date;
}[];
author: {
_id?: string;
first_name: string;
last_name: string;
father_name: string;
mobile: string;
gender: ("Male" | "Female" );
birth_date?: Date;
summary?: string;
national_number: string;
address: string;
level: ("Ghost" | "Manager" | "Editor" | "Ordinary" );
is_verified: boolean;
createdAt: Date;
updatedAt: Date;
};
editors?: {
_id?: string;
first_name: string;
last_name: string;
father_name: string;
mobile: string;
gender: ("Male" | "Female" );
birth_date?: Date;
summary?: string;
national_number: string;
address: string;
level: ("Ghost" | "Manager" | "Editor" | "Ordinary" );
is_verified: boolean;
createdAt: Date;
updatedAt: Date;
}[];
liked_by?: {
_id?: string;
first_name: string;
last_name: string;
father_name: string;
mobile: string;
gender: ("Male" | "Female" );
birth_date?: Date;
summary?: string;
national_number: string;
address: string;
level: ("Ghost" | "Manager" | "Editor" | "Ordinary" );
is_verified: boolean;
createdAt: Date;
updatedAt: Date;
}[];
bookmarked_by?: {
_id?: string;
first_name: string;
last_name: string;
father_name: string;
mobile: string;
gender: ("Male" | "Female" );
birth_date?: Date;
summary?: string;
national_number: string;
address: string;
level: ("Ghost" | "Manager" | "Editor" | "Ordinary" );
is_verified: boolean;
createdAt: Date;
updatedAt: Date;
}[];
related_articles?: {
_id?: string;
title: string;
content: string;
excerpt?: string;
title_en?: string;
content_en?: string;
excerpt_en?: string;
status: ("Draft" | "Published" | "Archived" | "Scheduled" );
type: ("Article" | "News" | "Research" | "Tutorial" | "Interview" );
published_at?: Date;
scheduled_at?: Date;
featured: boolean;
pinned: boolean;
sort_order: number;
slug?: string;
meta_title?: string;
meta_description?: string;
meta_title_en?: string;
meta_description_en?: string;
view_count: number;
like_count: number;
comment_count: number;
share_count: number;
estimated_reading_time?: number;
allow_comments: boolean;
featured_on_homepage: boolean;
social_image_alt?: string;
social_image_alt_en?: string;
abstract?: string;
abstract_en?: string;
keywords?: string;
keywords_en?: string;
doi?: string;
citation?: string;
has_gallery: boolean;
video_url?: string;
audio_url?: string;
archive_date?: Date;
last_modified_by_name?: string;
is_premium: boolean;
requires_login: boolean;
createdAt: Date;
updatedAt: Date;
}[];
related_courses?: {
_id?: string;
name: string;
description: string;
short_description?: string;
name_en?: string;
description_en?: string;
short_description_en?: string;
level: ("Beginner" | "Intermediate" | "Advanced" );
type: ("Course" | "Workshop" | "Bootcamp" | "Seminar" );
status: ("Draft" | "Active" | "Archived" | "Sold_Out" );
price: number;
original_price?: number;
is_free: boolean;
duration_weeks?: number;
duration_hours?: number;
max_students?: number;
min_students: number;
start_date?: Date;
end_date?: Date;
registration_deadline?: Date;
curriculum?: string;
prerequisites?: string;
learning_outcomes?: string;
instructor_name?: string;
instructor_bio?: string;
instructor_bio_en?: string;
average_rating: number;
total_reviews: number;
total_students: number;
slug?: string;
meta_title?: string;
meta_description?: string;
is_workshop: boolean;
workshop_location?: string;
is_online: boolean;
meeting_link?: string;
featured: boolean;
sort_order: number;
completion_points: number;
createdAt: Date;
updatedAt: Date;
}[];
referenced_files?: {
_id?: string;
name: string;
type: string;
size: number;
path: string;
url: string;
createdAt: Date;
updatedAt: Date;
}[];
};
;


    export type orderInp = {
      user?: number | userInp
wallet_transactions?: number | wallet_transactionInp
      
    }


    export type orderSchema = {
_id?: string;
order_number: string;
order_id: string;
status: ("pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded" | "failed" );
payment_status: ("pending" | "paid" | "partially_paid" | "failed" | "refunded" | "cancelled" );
order_type: ("course" | "workshop" | "product" | "mixed" );
items: {
item_id: string;
item_type: ("course" | "workshop" | "product" );
name: string;
name_en?: string;
price: number;
discounted_price?: number;
quantity: number;
total: number;
metadata?: string;
}[];
subtotal: number;
tax_amount: number;
discount_amount: number;
total_amount: number;
currency: string;
customer_email?: string;
customer_phone?: string;
customer_name: string;
billing_address?: string;
billing_city?: string;
billing_postal_code?: string;
billing_country: string;
shipping_address?: string;
shipping_city?: string;
shipping_postal_code?: string;
shipping_country?: string;
shipping_cost: number;
payment_method?: string;
payment_reference?: string;
gateway_transaction_id?: string;
gateway_response?: string;
shipped_at?: Date;
delivered_at?: Date;
admin_notes?: string;
internal_notes?: string;
tracking_number?: string;
tracking_url?: string;
refund_amount: number;
refund_reason?: string;
refunded_at?: Date;
createdAt: Date;
updatedAt: Date;
user: {
_id?: string;
first_name: string;
last_name: string;
father_name: string;
mobile: string;
gender: ("Male" | "Female" );
birth_date?: Date;
summary?: string;
national_number: string;
address: string;
level: ("Ghost" | "Manager" | "Editor" | "Ordinary" );
is_verified: boolean;
createdAt: Date;
updatedAt: Date;
};
wallet_transactions?: {
_id?: string;
transaction_id: string;
amount: number;
currency: string;
type: ("deposit" | "withdrawal" | "purchase" | "refund" | "transfer_in" | "transfer_out" | "bonus" | "penalty" | "commission" | "admin_deposit" | "admin_withdrawal" | "admin_adjustment" | "dispute_resolution" | "freeze_penalty" | "unfreeze_bonus" );
status: ("pending" | "processing" | "completed" | "failed" | "cancelled" | "refunded" );
payment_method?: ("zarinpal" | "bank_transfer" | "manual" | "wallet_balance" | "credit_card" | "other" );
description?: string;
reference_id?: string;
gateway_response?: string;
balance_before: number;
balance_after: number;
ip_address?: string;
user_agent?: string;
admin_notes?: string;
processed_by?: string;
processed_at?: string;
expires_at?: string;
createdAt: Date;
updatedAt: Date;
}[];
};
;


    export type enrollmentInp = {
      user?: number | userInp
course?: number | courseInp
order?: number | orderInp
certificate?: number | fileInp
      
    }


    export type enrollmentSchema = {
_id?: string;
enrollment_date: Date;
status: ("Active" | "Completed" | "Dropped" | "Suspended" | "Pending_Payment" );
progress_percentage: number;
completed_date?: Date;
points_earned: number;
points_used_for_enrollment: number;
total_paid: number;
discount_applied: number;
attendance_count: number;
assignment_scores?: string;
final_grade?: number;
certificate_issued: boolean;
certificate_issue_date?: Date;
notes?: string;
createdAt: Date;
updatedAt: Date;
user: {
_id?: string;
first_name: string;
last_name: string;
father_name: string;
mobile: string;
gender: ("Male" | "Female" );
birth_date?: Date;
summary?: string;
national_number: string;
address: string;
level: ("Ghost" | "Manager" | "Editor" | "Ordinary" );
is_verified: boolean;
createdAt: Date;
updatedAt: Date;
};
course: {
_id?: string;
name: string;
description: string;
short_description?: string;
name_en?: string;
description_en?: string;
short_description_en?: string;
level: ("Beginner" | "Intermediate" | "Advanced" );
type: ("Course" | "Workshop" | "Bootcamp" | "Seminar" );
status: ("Draft" | "Active" | "Archived" | "Sold_Out" );
price: number;
original_price?: number;
is_free: boolean;
duration_weeks?: number;
duration_hours?: number;
max_students?: number;
min_students: number;
start_date?: Date;
end_date?: Date;
registration_deadline?: Date;
curriculum?: string;
prerequisites?: string;
learning_outcomes?: string;
instructor_name?: string;
instructor_bio?: string;
instructor_bio_en?: string;
average_rating: number;
total_reviews: number;
total_students: number;
slug?: string;
meta_title?: string;
meta_description?: string;
is_workshop: boolean;
workshop_location?: string;
is_online: boolean;
meeting_link?: string;
featured: boolean;
sort_order: number;
completion_points: number;
createdAt: Date;
updatedAt: Date;
};
order?: {
_id?: string;
order_number: string;
order_id: string;
status: ("pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded" | "failed" );
payment_status: ("pending" | "paid" | "partially_paid" | "failed" | "refunded" | "cancelled" );
order_type: ("course" | "workshop" | "product" | "mixed" );
items: {
item_id: string;
item_type: ("course" | "workshop" | "product" );
name: string;
name_en?: string;
price: number;
discounted_price?: number;
quantity: number;
total: number;
metadata?: string;
}[];
subtotal: number;
tax_amount: number;
discount_amount: number;
total_amount: number;
currency: string;
customer_email?: string;
customer_phone?: string;
customer_name: string;
billing_address?: string;
billing_city?: string;
billing_postal_code?: string;
billing_country: string;
shipping_address?: string;
shipping_city?: string;
shipping_postal_code?: string;
shipping_country?: string;
shipping_cost: number;
payment_method?: string;
payment_reference?: string;
gateway_transaction_id?: string;
gateway_response?: string;
shipped_at?: Date;
delivered_at?: Date;
admin_notes?: string;
internal_notes?: string;
tracking_number?: string;
tracking_url?: string;
refund_amount: number;
refund_reason?: string;
refunded_at?: Date;
createdAt: Date;
updatedAt: Date;
};
certificate?: {
_id?: string;
name: string;
type: string;
size: number;
path: string;
url: string;
createdAt: Date;
updatedAt: Date;
};
};
;


    export type walletInp = {
      user?: number | userInp
      
    }


    export type walletSchema = {
_id?: string;
balance: number;
currency: ("IRR" | "USD" | "EUR" );
status: ("active" | "suspended" | "blocked" );
is_active: boolean;
last_transaction_at?: string;
createdAt: Date;
updatedAt: Date;
user: {
_id?: string;
first_name: string;
last_name: string;
father_name: string;
mobile: string;
gender: ("Male" | "Female" );
birth_date?: Date;
summary?: string;
national_number: string;
address: string;
level: ("Ghost" | "Manager" | "Editor" | "Ordinary" );
is_verified: boolean;
createdAt: Date;
updatedAt: Date;
};
};
;


    export type wallet_transactionInp = {
      wallet?: number | walletInp
user?: number | userInp
order?: number | orderInp
      
    }


    export type wallet_transactionSchema = {
_id?: string;
transaction_id: string;
amount: number;
currency: string;
type: ("deposit" | "withdrawal" | "purchase" | "refund" | "transfer_in" | "transfer_out" | "bonus" | "penalty" | "commission" | "admin_deposit" | "admin_withdrawal" | "admin_adjustment" | "dispute_resolution" | "freeze_penalty" | "unfreeze_bonus" );
status: ("pending" | "processing" | "completed" | "failed" | "cancelled" | "refunded" );
payment_method?: ("zarinpal" | "bank_transfer" | "manual" | "wallet_balance" | "credit_card" | "other" );
description?: string;
reference_id?: string;
gateway_response?: string;
balance_before: number;
balance_after: number;
ip_address?: string;
user_agent?: string;
admin_notes?: string;
processed_by?: string;
processed_at?: string;
expires_at?: string;
createdAt: Date;
updatedAt: Date;
wallet: {
_id?: string;
balance: number;
currency: ("IRR" | "USD" | "EUR" );
status: ("active" | "suspended" | "blocked" );
is_active: boolean;
last_transaction_at?: string;
createdAt: Date;
updatedAt: Date;
};
user: {
_id?: string;
first_name: string;
last_name: string;
father_name: string;
mobile: string;
gender: ("Male" | "Female" );
birth_date?: Date;
summary?: string;
national_number: string;
address: string;
level: ("Ghost" | "Manager" | "Editor" | "Ordinary" );
is_verified: boolean;
createdAt: Date;
updatedAt: Date;
};
order?: {
_id?: string;
order_number: string;
order_id: string;
status: ("pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded" | "failed" );
payment_status: ("pending" | "paid" | "partially_paid" | "failed" | "refunded" | "cancelled" );
order_type: ("course" | "workshop" | "product" | "mixed" );
items: {
item_id: string;
item_type: ("course" | "workshop" | "product" );
name: string;
name_en?: string;
price: number;
discounted_price?: number;
quantity: number;
total: number;
metadata?: string;
}[];
subtotal: number;
tax_amount: number;
discount_amount: number;
total_amount: number;
currency: string;
customer_email?: string;
customer_phone?: string;
customer_name: string;
billing_address?: string;
billing_city?: string;
billing_postal_code?: string;
billing_country: string;
shipping_address?: string;
shipping_city?: string;
shipping_postal_code?: string;
shipping_country?: string;
shipping_cost: number;
payment_method?: string;
payment_reference?: string;
gateway_transaction_id?: string;
gateway_response?: string;
shipped_at?: Date;
delivered_at?: Date;
admin_notes?: string;
internal_notes?: string;
tracking_number?: string;
tracking_url?: string;
refund_amount: number;
refund_reason?: string;
refunded_at?: Date;
createdAt: Date;
updatedAt: Date;
};
};
;


    export type productInp = {
      category_rel?: number | categoryInp
tags_rel?: number | tagInp
created_by_user?: number | userInp
updated_by_user?: number | userInp
      
    }


    export type productSchema = {
_id?: string;
title: string;
title_en?: string;
slug: string;
description: string;
description_en?: string;
type: ("book" | "artwork" | "article" | "cultural" | "other" );
category: ("books" | "digital_books" | "physical_books" | "artworks" | "paintings" | "sculptures" | "digital_art" | "articles" | "cultural_items" | "handicrafts" | "educational" | "research" | "other" );
status: ("active" | "draft" | "archived" | "out_of_stock" );
price: number;
discounted_price?: number;
stock_quantity?: number;
is_digital: boolean;
featured_image?: {
url: string;
alt?: string;
width?: number;
height?: number;
};
gallery?: {
url: string;
alt?: string;
width?: number;
height?: number;
}[];
tags: string[];
specifications?: string;
author?: string;
author_en?: string;
isbn?: string;
publisher?: string;
publisher_en?: string;
publication_date?: Date;
language: ("fa" | "en" | "ar" | "mixed" );
page_count?: number;
file_url?: string;
file_size?: number;
file_format?: ("pdf" | "epub" | "mobi" | "jpg" | "png" | "svg" | "mp4" | "mp3" | "zip" | "rar" );
dimensions?: {
width: number;
height: number;
depth?: number;
unit: ("cm" | "mm" | "inch" );
};
weight?: {
value: number;
unit: ("g" | "kg" | "lb" );
};
materials?: string[];
artist?: string;
artist_en?: string;
artwork_year?: number;
artwork_style?: string;
is_featured: boolean;
is_bestseller: boolean;
is_new: boolean;
view_count: number;
purchase_count: number;
rating: {
average: number;
count: number;
};
meta_title?: string;
meta_description?: string;
seo_keywords?: string[];
created_by?: string;
updated_by?: string;
createdAt: Date;
updatedAt: Date;
category_rel?: {
_id?: string;
name: string;
description: string;
createdAt: Date;
updatedAt: Date;
};
tags_rel?: {
_id?: string;
name: string;
description: string;
createdAt: Date;
updatedAt: Date;
}[];
created_by_user?: {
_id?: string;
first_name: string;
last_name: string;
father_name: string;
mobile: string;
gender: ("Male" | "Female" );
birth_date?: Date;
summary?: string;
national_number: string;
address: string;
level: ("Ghost" | "Manager" | "Editor" | "Ordinary" );
is_verified: boolean;
createdAt: Date;
updatedAt: Date;
};
updated_by_user?: {
_id?: string;
first_name: string;
last_name: string;
father_name: string;
mobile: string;
gender: ("Male" | "Female" );
birth_date?: Date;
summary?: string;
national_number: string;
address: string;
level: ("Ghost" | "Manager" | "Editor" | "Ordinary" );
is_verified: boolean;
createdAt: Date;
updatedAt: Date;
};
};
;


    export type scoring_transactionInp = {
      user?: number | userInp
order?: number | orderInp
course?: number | courseInp
      
    }


    export type scoring_transactionSchema = {
_id?: string;
points: number;
action: ("purchase" | "course_complete" | "referral" | "daily_login" | "workshop_booking" | "review_write" | "profile_complete" | "social_share" | "bonus" | "penalty" | "manual_adjustment" );
status: ("pending" | "completed" | "cancelled" | "expired" );
description: string;
metadata?: string;
reference_id?: string;
reference_type?: ("order" | "course" | "referral" | "booking" | "review" | "other" );
admin_notes?: string;
processed_by?: string;
expires_at?: string;
processed_at?: string;
ip_address?: string;
user_agent?: string;
createdAt: Date;
updatedAt: Date;
user: {
_id?: string;
first_name: string;
last_name: string;
father_name: string;
mobile: string;
gender: ("Male" | "Female" );
birth_date?: Date;
summary?: string;
national_number: string;
address: string;
level: ("Ghost" | "Manager" | "Editor" | "Ordinary" );
is_verified: boolean;
createdAt: Date;
updatedAt: Date;
};
order?: {
_id?: string;
order_number: string;
order_id: string;
status: ("pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded" | "failed" );
payment_status: ("pending" | "paid" | "partially_paid" | "failed" | "refunded" | "cancelled" );
order_type: ("course" | "workshop" | "product" | "mixed" );
items: {
item_id: string;
item_type: ("course" | "workshop" | "product" );
name: string;
name_en?: string;
price: number;
discounted_price?: number;
quantity: number;
total: number;
metadata?: string;
}[];
subtotal: number;
tax_amount: number;
discount_amount: number;
total_amount: number;
currency: string;
customer_email?: string;
customer_phone?: string;
customer_name: string;
billing_address?: string;
billing_city?: string;
billing_postal_code?: string;
billing_country: string;
shipping_address?: string;
shipping_city?: string;
shipping_postal_code?: string;
shipping_country?: string;
shipping_cost: number;
payment_method?: string;
payment_reference?: string;
gateway_transaction_id?: string;
gateway_response?: string;
shipped_at?: Date;
delivered_at?: Date;
admin_notes?: string;
internal_notes?: string;
tracking_number?: string;
tracking_url?: string;
refund_amount: number;
refund_reason?: string;
refunded_at?: Date;
createdAt: Date;
updatedAt: Date;
};
course?: {
_id?: string;
name: string;
description: string;
short_description?: string;
name_en?: string;
description_en?: string;
short_description_en?: string;
level: ("Beginner" | "Intermediate" | "Advanced" );
type: ("Course" | "Workshop" | "Bootcamp" | "Seminar" );
status: ("Draft" | "Active" | "Archived" | "Sold_Out" );
price: number;
original_price?: number;
is_free: boolean;
duration_weeks?: number;
duration_hours?: number;
max_students?: number;
min_students: number;
start_date?: Date;
end_date?: Date;
registration_deadline?: Date;
curriculum?: string;
prerequisites?: string;
learning_outcomes?: string;
instructor_name?: string;
instructor_bio?: string;
instructor_bio_en?: string;
average_rating: number;
total_reviews: number;
total_students: number;
slug?: string;
meta_title?: string;
meta_description?: string;
is_workshop: boolean;
workshop_location?: string;
is_online: boolean;
meeting_link?: string;
featured: boolean;
sort_order: number;
completion_points: number;
createdAt: Date;
updatedAt: Date;
};
};
;


    export type user_levelInp = {
      user?: number | userInp
      
    }


    export type user_levelSchema = {
_id?: string;
current_points: number;
total_lifetime_points: number;
level: number;
status: ("active" | "frozen" | "penalty" );
achievements: string[];
achievement_count: number;
points_to_next_level: number;
level_progress_percentage: number;
last_points_earned_at?: Date;
last_level_up_at?: Date;
last_achievement_at?: Date;
total_purchases: number;
total_courses_completed: number;
total_referrals: number;
total_logins: number;
daily_login_streak: number;
max_daily_login_streak: number;
points_from_purchases: number;
points_from_courses: number;
points_from_referrals: number;
points_from_activities: number;
points_from_bonuses: number;
total_penalties: number;
points_lost_penalties: number;
current_multiplier: number;
bonus_expires_at?: Date;
rank_position?: number;
rank_updated_at?: Date;
is_frozen: boolean;
freeze_reason?: string;
admin_notes?: string;
manual_adjustments: number;
createdAt: Date;
updatedAt: Date;
user: {
_id?: string;
first_name: string;
last_name: string;
father_name: string;
mobile: string;
gender: ("Male" | "Female" );
birth_date?: Date;
summary?: string;
national_number: string;
address: string;
level: ("Ghost" | "Manager" | "Editor" | "Ordinary" );
is_verified: boolean;
createdAt: Date;
updatedAt: Date;
};
};
;


    export type referralInp = {
      referrer?: number | userInp
referee?: number | userInp
triggering_order?: number | orderInp
related_orders?: number | orderInp
      
    }


    export type referralSchema = {
_id?: string;
referral_code: string;
referral_type: ("direct" | "group" | "campaign" | "affiliate" );
status: ("pending" | "registered" | "first_purchase" | "completed" | "rewarded" | "expired" | "cancelled" );
commission_rate: number;
commission_earned: number;
commission_status: ("pending" | "calculated" | "paid" | "cancelled" | "on_hold" );
commission_paid_at?: Date;
first_purchase_amount?: number;
total_purchase_amount: number;
purchase_count: number;
registered_at?: Date;
first_purchase_at?: Date;
completed_at?: Date;
rewarded_at?: Date;
expires_at?: Date;
group_discount_applied: boolean;
group_size: number;
group_discount_percentage: number;
campaign_id?: string;
campaign_name?: string;
source?: string;
medium?: string;
metadata?: string;
tracking_data?: string;
admin_notes?: string;
is_verified: boolean;
fraud_check_status: ("pending" | "passed" | "failed" | "manual_review" );
blocked_reason?: string;
bonus_amount: number;
penalty_amount: number;
click_count: number;
conversion_rate: number;
createdAt: Date;
updatedAt: Date;
referrer: {
_id?: string;
first_name: string;
last_name: string;
father_name: string;
mobile: string;
gender: ("Male" | "Female" );
birth_date?: Date;
summary?: string;
national_number: string;
address: string;
level: ("Ghost" | "Manager" | "Editor" | "Ordinary" );
is_verified: boolean;
createdAt: Date;
updatedAt: Date;
};
referee?: {
_id?: string;
first_name: string;
last_name: string;
father_name: string;
mobile: string;
gender: ("Male" | "Female" );
birth_date?: Date;
summary?: string;
national_number: string;
address: string;
level: ("Ghost" | "Manager" | "Editor" | "Ordinary" );
is_verified: boolean;
createdAt: Date;
updatedAt: Date;
};
triggering_order?: {
_id?: string;
order_number: string;
order_id: string;
status: ("pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded" | "failed" );
payment_status: ("pending" | "paid" | "partially_paid" | "failed" | "refunded" | "cancelled" );
order_type: ("course" | "workshop" | "product" | "mixed" );
items: {
item_id: string;
item_type: ("course" | "workshop" | "product" );
name: string;
name_en?: string;
price: number;
discounted_price?: number;
quantity: number;
total: number;
metadata?: string;
}[];
subtotal: number;
tax_amount: number;
discount_amount: number;
total_amount: number;
currency: string;
customer_email?: string;
customer_phone?: string;
customer_name: string;
billing_address?: string;
billing_city?: string;
billing_postal_code?: string;
billing_country: string;
shipping_address?: string;
shipping_city?: string;
shipping_postal_code?: string;
shipping_country?: string;
shipping_cost: number;
payment_method?: string;
payment_reference?: string;
gateway_transaction_id?: string;
gateway_response?: string;
shipped_at?: Date;
delivered_at?: Date;
admin_notes?: string;
internal_notes?: string;
tracking_number?: string;
tracking_url?: string;
refund_amount: number;
refund_reason?: string;
refunded_at?: Date;
createdAt: Date;
updatedAt: Date;
};
related_orders?: {
_id?: string;
order_number: string;
order_id: string;
status: ("pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded" | "failed" );
payment_status: ("pending" | "paid" | "partially_paid" | "failed" | "refunded" | "cancelled" );
order_type: ("course" | "workshop" | "product" | "mixed" );
items: {
item_id: string;
item_type: ("course" | "workshop" | "product" );
name: string;
name_en?: string;
price: number;
discounted_price?: number;
quantity: number;
total: number;
metadata?: string;
}[];
subtotal: number;
tax_amount: number;
discount_amount: number;
total_amount: number;
currency: string;
customer_email?: string;
customer_phone?: string;
customer_name: string;
billing_address?: string;
billing_city?: string;
billing_postal_code?: string;
billing_country: string;
shipping_address?: string;
shipping_city?: string;
shipping_postal_code?: string;
shipping_country?: string;
shipping_cost: number;
payment_method?: string;
payment_reference?: string;
gateway_transaction_id?: string;
gateway_response?: string;
shipped_at?: Date;
delivered_at?: Date;
admin_notes?: string;
internal_notes?: string;
tracking_number?: string;
tracking_url?: string;
refund_amount: number;
refund_reason?: string;
refunded_at?: Date;
createdAt: Date;
updatedAt: Date;
}[];
};
;


    export type bookingInp = {
      user?: number | userInp
workshop?: number | courseInp
order?: number | orderInp
wallet_transaction?: number | wallet_transactionInp
      
    }


    export type bookingSchema = {
_id?: string;
booking_number: string;
booking_id: string;
space_type: ("private_office" | "shared_desk" | "meeting_room" | "workshop_space" | "conference_room" | "studio" );
space_name?: string;
space_location?: string;
booking_date: Date;
start_time: ("08:00" | "09:00" | "10:00" | "11:00" | "12:00" | "13:00" | "14:00" | "15:00" | "16:00" | "17:00" | "18:00" | "19:00" | "20:00" );
end_time: ("08:00" | "09:00" | "10:00" | "11:00" | "12:00" | "13:00" | "14:00" | "15:00" | "16:00" | "17:00" | "18:00" | "19:00" | "20:00" );
duration_hours: number;
capacity_requested: number;
capacity_available?: number;
attendee_count: number;
status: ("pending" | "confirmed" | "checked_in" | "completed" | "cancelled" | "no_show" );
payment_status: ("pending" | "paid" | "refunded" | "failed" | "partial_refund" );
hourly_rate: number;
total_hours: number;
base_price: number;
additional_services_cost: number;
discount_amount: number;
total_price: number;
currency: string;
customer_name: string;
customer_email?: string;
customer_phone?: string;
company_name?: string;
purpose?: string;
special_requirements?: string;
equipment_needed?: string;
catering_required: boolean;
workshop_session_id?: string;
is_workshop_booking: boolean;
checked_in_at?: Date;
checked_out_at?: Date;
actual_duration?: number;
payment_method?: string;
payment_reference?: string;
gateway_transaction_id?: string;
cancelled_at?: Date;
cancellation_reason?: string;
cancellation_fee: number;
refund_amount: number;
reminder_sent: boolean;
confirmation_sent: boolean;
rating?: number;
feedback?: string;
admin_notes?: string;
internal_notes?: string;
approved_by?: string;
is_recurring: boolean;
recurring_pattern?: string;
recurring_end_date?: Date;
parent_booking_id?: string;
createdAt: Date;
updatedAt: Date;
user: {
_id?: string;
first_name: string;
last_name: string;
father_name: string;
mobile: string;
gender: ("Male" | "Female" );
birth_date?: Date;
summary?: string;
national_number: string;
address: string;
level: ("Ghost" | "Manager" | "Editor" | "Ordinary" );
is_verified: boolean;
createdAt: Date;
updatedAt: Date;
};
workshop?: {
_id?: string;
name: string;
description: string;
short_description?: string;
name_en?: string;
description_en?: string;
short_description_en?: string;
level: ("Beginner" | "Intermediate" | "Advanced" );
type: ("Course" | "Workshop" | "Bootcamp" | "Seminar" );
status: ("Draft" | "Active" | "Archived" | "Sold_Out" );
price: number;
original_price?: number;
is_free: boolean;
duration_weeks?: number;
duration_hours?: number;
max_students?: number;
min_students: number;
start_date?: Date;
end_date?: Date;
registration_deadline?: Date;
curriculum?: string;
prerequisites?: string;
learning_outcomes?: string;
instructor_name?: string;
instructor_bio?: string;
instructor_bio_en?: string;
average_rating: number;
total_reviews: number;
total_students: number;
slug?: string;
meta_title?: string;
meta_description?: string;
is_workshop: boolean;
workshop_location?: string;
is_online: boolean;
meeting_link?: string;
featured: boolean;
sort_order: number;
completion_points: number;
createdAt: Date;
updatedAt: Date;
};
order?: {
_id?: string;
order_number: string;
order_id: string;
status: ("pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded" | "failed" );
payment_status: ("pending" | "paid" | "partially_paid" | "failed" | "refunded" | "cancelled" );
order_type: ("course" | "workshop" | "product" | "mixed" );
items: {
item_id: string;
item_type: ("course" | "workshop" | "product" );
name: string;
name_en?: string;
price: number;
discounted_price?: number;
quantity: number;
total: number;
metadata?: string;
}[];
subtotal: number;
tax_amount: number;
discount_amount: number;
total_amount: number;
currency: string;
customer_email?: string;
customer_phone?: string;
customer_name: string;
billing_address?: string;
billing_city?: string;
billing_postal_code?: string;
billing_country: string;
shipping_address?: string;
shipping_city?: string;
shipping_postal_code?: string;
shipping_country?: string;
shipping_cost: number;
payment_method?: string;
payment_reference?: string;
gateway_transaction_id?: string;
gateway_response?: string;
shipped_at?: Date;
delivered_at?: Date;
admin_notes?: string;
internal_notes?: string;
tracking_number?: string;
tracking_url?: string;
refund_amount: number;
refund_reason?: string;
refunded_at?: Date;
createdAt: Date;
updatedAt: Date;
};
wallet_transaction?: {
_id?: string;
transaction_id: string;
amount: number;
currency: string;
type: ("deposit" | "withdrawal" | "purchase" | "refund" | "transfer_in" | "transfer_out" | "bonus" | "penalty" | "commission" | "admin_deposit" | "admin_withdrawal" | "admin_adjustment" | "dispute_resolution" | "freeze_penalty" | "unfreeze_bonus" );
status: ("pending" | "processing" | "completed" | "failed" | "cancelled" | "refunded" );
payment_method?: ("zarinpal" | "bank_transfer" | "manual" | "wallet_balance" | "credit_card" | "other" );
description?: string;
reference_id?: string;
gateway_response?: string;
balance_before: number;
balance_after: number;
ip_address?: string;
user_agent?: string;
admin_notes?: string;
processed_by?: string;
processed_at?: string;
expires_at?: string;
createdAt: Date;
updatedAt: Date;
};
};
;


    export type space_availabilityInp = {
      
      
    }


    export type space_availabilitySchema = {
_id?: string;
date: Date;
space_type: ("private_office" | "shared_desk" | "meeting_room" | "workshop_space" | "conference_room" | "studio" | "event_hall" | "phone_booth" | "lounge_area" );
space_identifier?: string;
total_capacity: number;
booked_capacity: number;
available_capacity: number;
overall_status: ("available" | "partially_booked" | "fully_booked" | "maintenance" | "blocked" | "unavailable" );
available_slots: {
start_time: ("08:00" | "08:30" | "09:00" | "09:30" | "10:00" | "10:30" | "11:00" | "11:30" | "12:00" | "12:30" | "13:00" | "13:30" | "14:00" | "14:30" | "15:00" | "15:30" | "16:00" | "16:30" | "17:00" | "17:30" | "18:00" | "18:30" | "19:00" | "19:30" | "20:00" );
end_time: ("08:00" | "08:30" | "09:00" | "09:30" | "10:00" | "10:30" | "11:00" | "11:30" | "12:00" | "12:30" | "13:00" | "13:30" | "14:00" | "14:30" | "15:00" | "15:30" | "16:00" | "16:30" | "17:00" | "17:30" | "18:00" | "18:30" | "19:00" | "19:30" | "20:00" );
available_capacity: number;
booked_capacity: number;
status: ("available" | "partially_booked" | "fully_booked" | "maintenance" | "blocked" | "unavailable" );
price_per_hour?: number;
is_peak_time: boolean;
}[];
blocked_slots: {
start_time: ("08:00" | "08:30" | "09:00" | "09:30" | "10:00" | "10:30" | "11:00" | "11:30" | "12:00" | "12:30" | "13:00" | "13:30" | "14:00" | "14:30" | "15:00" | "15:30" | "16:00" | "16:30" | "17:00" | "17:30" | "18:00" | "18:30" | "19:00" | "19:30" | "20:00" );
end_time: ("08:00" | "08:30" | "09:00" | "09:30" | "10:00" | "10:30" | "11:00" | "11:30" | "12:00" | "12:30" | "13:00" | "13:30" | "14:00" | "14:30" | "15:00" | "15:30" | "16:00" | "16:30" | "17:00" | "17:30" | "18:00" | "18:30" | "19:00" | "19:30" | "20:00" );
available_capacity: number;
booked_capacity: number;
status: ("available" | "partially_booked" | "fully_booked" | "maintenance" | "blocked" | "unavailable" );
price_per_hour?: number;
is_peak_time: boolean;
}[];
opening_time: string;
closing_time: string;
is_operating_day: boolean;
base_hourly_rate: number;
peak_hour_rate?: number;
discount_rate?: number;
peak_hours: string[];
is_weekend: boolean;
is_holiday: boolean;
maintenance_scheduled: boolean;
maintenance_reason?: string;
maintenance_start?: string;
maintenance_end?: string;
special_event: boolean;
event_name?: string;
restricted_access: boolean;
restriction_reason?: string;
minimum_booking_hours: number;
maximum_booking_hours: number;
advance_booking_days: number;
cancellation_policy?: string;
last_booking_at?: Date;
last_cancellation_at?: Date;
occupancy_rate: number;
total_bookings: number;
total_revenue: number;
average_booking_duration: number;
manually_blocked: boolean;
block_reason?: string;
blocked_by?: string;
blocked_until?: Date;
low_availability_threshold: number;
alert_sent: boolean;
cache_expires_at?: Date;
last_calculated_at: Date;
createdAt: Date;
updatedAt: Date;
};
;


    export type ReqType = {

  
        main: {

      
        }

      
    };

  
export type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export const lesanApi = (
	{ URL, settings, baseHeaders }: {
		URL: string;
		settings?: Record<string, any>;
		baseHeaders?: Record<string, any>;
	},
) => {
	const setting = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			...baseHeaders,
		},
		...settings,
	};

	const setHeaders = (headers: Record<string, any>) => {
		setting.headers = {
			...setting.headers,
			...headers,
		};
	};

	const getSetting = () => setting;

	const send = async <
		TService extends keyof ReqType,
		TModel extends keyof ReqType[TService],
		TAct extends keyof ReqType[TService][TModel],
    // @ts-ignore: Unreachable code error
		TSet extends DeepPartial<ReqType[TService][TModel][TAct]["set"]>,
    // @ts-ignore: Unreachable code error
		TGet extends DeepPartial<ReqType[TService][TModel][TAct]["get"]>,
	>(body: {
		service?: TService;
		model: TModel;
		act: TAct;
		details: {
			set: TSet;
			get: TGet;
		};
	}, additionalHeaders?: Record<string, any>) => {
		const req = await fetch(URL, {
			...getSetting(),
			headers: {
				...getSetting().headers,
				...additionalHeaders,
		    connection: "keep-alive",
			},
			body: JSON.stringify(body),
		});

		return await req.json();
	};

	return { send, setHeaders };
};

  